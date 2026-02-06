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
    console.error(error);
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
    await admin.messaging().send(message);
    return true;
  } catch {
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
        aps: { alert: { title, body }, sound: "default", badge: 1 },
      },
    },
  };
  try {
    await admin.messaging().send(message);
    return true;
  } catch {
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
  if (!pushToken) return false;
  const platform = detectPlatform(pushToken);
  if (!platform) return false;

  const data: Record<string, string> = { ppaId };
  if (notificationType) data.notificationType = notificationType;

  let success = false;
  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({ fcmToken: pushToken, title, body, data });
    } else {
      success = await sendAPNsNotification({ apnsToken: pushToken, title, body, data });
    }
    return success;
  } catch {
    return false;
  }
}

async function checkDayBeforeReminders() {
  const activeUsers = await userRepository.findActiveUsersWithPushTokens();
  if (!activeUsers || activeUsers.length === 0) return;

  const ppas = await ppaRepository.findAllWithoutDayBeforeNotification();
  if (!ppas || ppas.length === 0) return;

  const now = dateTime.now();

  for (const ppa of ppas) {
    if (!ppa.startDate) continue;
    const startDateTime = dateTime.parse(ppa.startDate);
    const tomorrow = now.clone().add(1, "day");
    const isTomorrow = startDateTime.isSame(tomorrow, "day");
    if (!isTomorrow) continue;

    let successCount = 0;
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

      if (success) sentReminders.add(reminderKey);
      successCount++;
      await new Promise(r => setTimeout(r, 100));
    }
    if (successCount > 0) await ppaRepository.update(ppa.id, { dayBeforeNotifiedAt: new Date() });
  }
}

async function checkHourBeforeReminders() {
  const activeUsers = await userRepository.findActiveUsersWithPushTokens();
  if (!activeUsers || activeUsers.length === 0) return;

  const ppas = await ppaRepository.findTodayPPAsWithoutHourNotification();
  if (!ppas || ppas.length === 0) return;

  const now = dateTime.now();

  for (const ppa of ppas) {
    if (!ppa.startDate) continue;
    const startDateTime = dateTime.parse(ppa.startDate);
    const isToday = startDateTime.isSame(now, "day");
    if (!isToday) continue;

    const minutesUntilStart = startDateTime.diff(now, "minutes");
    if (minutesUntilStart < 110 || minutesUntilStart > 130) continue;

    let successCount = 0;
    for (const user of activeUsers) {
      if (!user.pushToken) continue;
      const reminderKey = `${ppa.id}-${user.id}-hour-before`;
      if (sentReminders.has(reminderKey)) continue;

      const success = await sendPushNotification({
        ppaId: ppa.id,
        pushToken: user.pushToken,
        title: `⏰ Starting Soon: ${ppa.task}`,
        body: `Your event starts in about 2 hours at ${dateTime.formatTime(ppa.startDate)}. Location: ${ppa.venue || ppa.address}`,
        notificationType: "hour_before",
      });

      if (success) sentReminders.add(reminderKey);
      successCount++;
      await new Promise(r => setTimeout(r, 100));
    }
    if (successCount > 0) await ppaRepository.update(ppa.id, { hourBeforeNotifiedAt: new Date() });
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
  if (!pushToken) return false;
  const platform = detectPlatform(pushToken);
  if (!platform) return false;

  const data = { ppaId };
  let success = false;
  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({ fcmToken: pushToken, title, body, data });
    } else {
      success = await sendAPNsNotification({ apnsToken: pushToken, title, body, data });
    }
    return success;
  } catch {
    return false;
  }
}

export function startCronScheduler() {
  cron.schedule("* * * * *", async () => { await checkHourBeforeReminders(); });
  cron.schedule("0 15 * * *", async () => { await checkDayBeforeReminders(); });
}
