import admin from "firebase-admin";
import cron from "node-cron";
import { ppaRepository } from "@/data/ppa";
import { userRepository } from "@/data/user"; 
import { dateTime } from "@/utils/dates";
import { envConfig } from "@/config/env";

const serviceAccount = JSON.parse(
  Buffer.from(envConfig.SERVICE_ACCOUNT_JSON!, "base64").toString()
);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
  }
}

const sentReminders = new Set<string>();

function detectPlatform(pushToken: string): "fcm" | "apns" | null {
  if (!pushToken) return null;
  if (/^[0-9a-f]{64}$/i.test(pushToken)) return "apns";
  return "fcm";
}

async function sendFCMNotification({
  fcmToken,
  title,
  body,
  data = {},
}: {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data,
    android: {
      priority: "high" as const,
      notification: {
        channelId: "default",
        sound: "default",
        priority: "high" as const,
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return true;
  } catch (error) {
    console.error("❌ Error sending FCM notification:", error);
    return false;
  }
}

async function sendAPNsNotification({
  apnsToken,
  title,
  body,
  data = {},
}: {
  apnsToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const message = {
    token: apnsToken,
    notification: { title, body },
    data,
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: "default",
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return true;
  } catch (error) {
    console.error("❌ Error sending APNs notification:", error);
    return false;
  }
}

async function sendPushNotification({
  ppaId,
  pushToken,
  title,
  body,
  notificationType,
}: {
  ppaId: string;
  pushToken: string;
  title: string;
  body: string;
  notificationType: "day_before" | "hour_before";
}) {
  if (!pushToken) {
    console.warn(`❌ No push token provided for PPA: ${ppaId}`);
    return false;
  }

  const platform = detectPlatform(pushToken);
  if (!platform) {
    console.warn(
      `❌ Could not detect platform for token: ${pushToken.substring(0, 20)}...`
    );
    return false;
  }

  const data: Record<string, string> = { ppaId };
  if (notificationType) {
    data.notificationType = notificationType;
  }

  let success = false;

  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({
        fcmToken: pushToken,
        title,
        body,
        data,
      });
    } else {
      success = await sendAPNsNotification({
        apnsToken: pushToken,
        title,
        body,
        data,
      });
    }

    return success;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return false;
  }
}

async function checkDayBeforeReminders() {
  const now = dateTime.now();
  const currentHour = now.hour();
  const currentMinute = now.minute();

  if (currentHour !== 15 || currentMinute !== 0) {
    return;
  }

  const activeUsers = await userRepository.findActiveUsersWithPushTokens();

  if (!activeUsers || activeUsers.length === 0) {
    console.log("⚠️ No active users with push tokens found");
    return;
  }

  const ppas = await ppaRepository.findAllWithoutDayBeforeNotification();

  for (const ppa of ppas) {
    if (!ppa.startDate) continue;

    const startDateTime = dateTime.parse(ppa.startDate);
    const tomorrow = dateTime.now().add(1, "day");

    const isTomorrow = startDateTime.isSame(tomorrow, "day");

    if (!isTomorrow) continue;

    let successCount = 0;
    let failCount = 0;

    for (const user of activeUsers) {
      if (!user.pushToken) continue;

      const reminderKey = `${ppa.id}-${user.id}-day-before`;
      
      if (sentReminders.has(reminderKey)) continue;

      const success = await sendPushNotification({
        ppaId: ppa.id,
        pushToken: user.pushToken,
        title: `📅 Reminder: ${ppa.task} starts tomorrow!`,
        body: `It begins at ${dateTime.formatTime(ppa.startDate)} and ends on ${dateTime.formatDateShort(ppa.dueDate)} at ${dateTime.formatTime(ppa.dueDate)}. Don't forget to prepare!`,
        notificationType: "day_before",
      });

      if (success) {
        sentReminders.add(reminderKey);
        successCount++;
      } else {
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (successCount > 0) {
      await ppaRepository.update(ppa.id, { dayBeforeNotifiedAt: new Date() });
      console.log(
        `✅ Sent day-before reminder for PPA "${ppa.task}" to ${successCount} users (${failCount} failed)`
      );
    } else {
      console.error(
        `❌ Failed to send day-before reminder for PPA "${ppa.task}" to any users`
      );
    }
  }
}

async function checkHourBeforeReminders() {
  const activeUsers = await userRepository.findActiveUsersWithPushTokens();

  if (!activeUsers || activeUsers.length === 0) {
    return;
  }

  const ppas = await ppaRepository.findTodayPPAsWithoutHourNotification();
  const now = dateTime.now();

  for (const ppa of ppas) {
    if (!ppa.startDate) continue;

    const startDateTime = dateTime.parse(ppa.startDate);

    const isToday = startDateTime.isSame(now, "day");

    if (!isToday) {
      continue;
    }

    const minutesUntilStart = startDateTime.diff(now, "minutes");

    if (minutesUntilStart < 110 || minutesUntilStart > 130) {
      continue;
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of activeUsers) {
      if (!user.pushToken) continue;

      const reminderKey = `${ppa.id}-${user.id}-hour-before`;
      
      if (sentReminders.has(reminderKey)) {
        continue;
      }

      const success = await sendPushNotification({
        ppaId: ppa.id,
        pushToken: user.pushToken,
        title: `⏰ Starting Soon: ${ppa.task}`,
        body: `Your event starts in about 2 hours at ${dateTime.formatTime(ppa.startDate)}. Location: ${ppa.venue || ppa.address}`,
        notificationType: "hour_before",
      });

      if (success) {
        sentReminders.add(reminderKey);
        successCount++;
      } else {
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (successCount > 0) {
      await ppaRepository.update(ppa.id, { hourBeforeNotifiedAt: new Date() });
      console.log(
        `✅ Sent 2-hour reminder for PPA "${ppa.task}" to ${successCount} users (${failCount} failed)`
      );
    } else {
      console.error(
        `❌ Failed to send 2-hour reminder for PPA "${ppa.task}" to any users`
      );
    }
  }
}

export async function remindReschedulePPA({
  ppaId,
  pushToken,
  title,
  body,
}: {
  ppaId: string;
  pushToken: string;
  title: string;
  body: string;
}) {
  if (!pushToken) {
    console.warn(`❌ No push token provided for PPA: ${ppaId}`);
    return false;
  }

  const platform = detectPlatform(pushToken);
  if (!platform) {
    console.warn(
      `❌ Could not detect platform for token: ${pushToken.substring(0, 20)}...`
    );
    return false;
  }

  const data = { ppaId };
  let success = false;

  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({
        fcmToken: pushToken,
        title,
        body,
        data,
      });
    } else {
      success = await sendAPNsNotification({
        apnsToken: pushToken,
        title,
        body,
        data,
      });
    }

    return success;
  } catch (error) {
    console.error("❌ Error sending reschedule notification:", error);
    return false;
  }
}

export function startCronScheduler() {
  console.log("🚀 Starting cron scheduler in Asia/Manila timezone");
  console.log("📢 Notifications will be sent to all ACTIVE users");

  cron.schedule("* * * * *", async () => {
    await checkHourBeforeReminders();
  });

  cron.schedule("* * * * *", async () => {
    await checkDayBeforeReminders();
  });

  console.log("✅ Cron scheduler started successfully");
}