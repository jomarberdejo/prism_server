import admin from "firebase-admin";
import cron from "node-cron";
import { isTomorrow, isToday, differenceInMinutes } from "date-fns";
import { ppaRepository } from "@/data/ppa";
import { formatDate, formatTime } from "@/utils/dates";

var serviceAccount = require("../../service-account.json");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
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
  data = {} 
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
        priority: "high" as const 
      } 
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ FCM notification sent:", response);
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
  data = {} 
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
          badge: 1 
        } 
      } 
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ APNs notification sent:", response);
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
  notificationType 
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
    console.warn(`❌ Could not detect platform for token: ${pushToken.substring(0, 20)}...`);
    return false;
  }

  const data = { ppaId, notificationType };
  let success = false;

  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({ 
        fcmToken: pushToken, 
        title, 
        body, 
        data 
      });
    } else {
      success = await sendAPNsNotification({ 
        apnsToken: pushToken, 
        title, 
        body, 
        data 
      });
    }

    if (success) {
      const updateField = notificationType === "day_before" 
        ? { dayBeforeNotifiedAt: new Date() } 
        : { hourBeforeNotifiedAt: new Date() };
      await ppaRepository.update(ppaId, updateField);
    }

    return success;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return false;
  }
}

/**
 * Check for PPAs starting tomorrow and send 3 PM reminder
 * This runs every minute but only sends at 3 PM
 */
async function checkDayBeforeReminders() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Only run at 3 PM (15:00)
  if (currentHour !== 15 || currentMinute !== 0) {
    return;
  }

  console.log("⏰ Checking for PPAs starting tomorrow (3 PM reminder)...");
  
  const ppas = await ppaRepository.findAllWithoutDayBeforeNotification();

  for (const ppa of ppas) {
    if (!ppa.startDate) continue;

    const startDate = new Date(ppa.startDate);

    // Check if event is tomorrow
    if (!isTomorrow(startDate)) continue;

    const reminderKey = `${ppa.id}-day-before`;
    if (sentReminders.has(reminderKey)) continue;

    const userPushToken = ppa.user?.pushToken;
    if (!userPushToken) {
      console.warn(`⚠️ Skipping day-before reminder for PPA "${ppa.task}" - no push token found`);
      continue;
    }

    const success = await sendPushNotification({
      ppaId: ppa.id,
      pushToken: userPushToken,
      title: `📅 Reminder: ${ppa.task} starts tomorrow!`,
      body: `It begins at ${formatTime(ppa.startDate)} and ends on ${formatDate(ppa.dueDate)} at ${formatTime(ppa.dueTime)}. Don't forget to prepare!`,
      notificationType: "day_before",
    });

    if (success) {
      sentReminders.add(reminderKey);
      console.log(`✅ Sent day-before reminder for PPA: ${ppa.task}`);
    } else {
      console.error(`❌ Failed to send day-before reminder for PPA: ${ppa.task}`);
    }
  }
}

/**
 * Check for PPAs starting in 2 hours and send reminder
 * This runs every minute and checks if start time is approaching
 */
async function checkHourBeforeReminders() {
  console.log("⏰ Checking for PPAs starting in 2 hours...");
  
  const ppas = await ppaRepository.findTodayPPAsWithoutHourNotification();
  const now = new Date();

  for (const ppa of ppas) {
    if (!ppa.startDate || !ppa.startTime) continue;

    // Combine date and time for accurate comparison
    const startDateTime = new Date(ppa.startDate);
    const startTime = new Date(ppa.startTime);
    startDateTime.setHours(startTime.getHours());
    startDateTime.setMinutes(startTime.getMinutes());
    startDateTime.setSeconds(0);

    // Check if event is today
    if (!isToday(startDateTime)) continue;

    // Calculate time difference in minutes
    const minutesUntilStart = differenceInMinutes(startDateTime, now);

    // Send notification if event starts in 115-125 minutes (2 hours window with buffer)
    if (minutesUntilStart < 115 || minutesUntilStart > 125) continue;

    const reminderKey = `${ppa.id}-hour-before`;
    if (sentReminders.has(reminderKey)) continue;

    const userPushToken = ppa.user?.pushToken;
    if (!userPushToken) {
      console.warn(`⚠️ Skipping 2-hour-before reminder for PPA "${ppa.task}" - no push token found`);
      continue;
    }

    const success = await sendPushNotification({
      ppaId: ppa.id,
      pushToken: userPushToken,
      title: `⏰ Starting Soon: ${ppa.task}`,
      body: `Your event starts in about 2 hours at ${formatTime(ppa.startTime)}. Location: ${ppa.venue || ppa.address}`,
      notificationType: "hour_before",
    });

    if (success) {
      sentReminders.add(reminderKey);
      console.log(`✅ Sent 2-hour-before reminder for PPA: ${ppa.task}`);
    } else {
      console.error(`❌ Failed to send 2-hour-before reminder for PPA: ${ppa.task}`);
    }
  }
}

/**
 * Reschedule notification (call directly)
 */
export async function remindReschedulePPA({ 
  ppaId, 
  pushToken, 
  title, 
  body 
}: { 
  ppaId: string; 
  pushToken: string; 
  title: string; 
  body: string; 
}) {
  const success = await sendPushNotification({
    ppaId,
    pushToken,
    title,
    body,
    notificationType: "day_before",
  });

  console.log("📬 RESCHEDULE NOTIFICATION SENT:", success);
  return success;
}

/**
 * Start the cron scheduler for automated reminders
 */
export function startCronScheduler() {
  // Check every minute for hour-before reminders
  cron.schedule("* * * * *", async () => {
    await checkHourBeforeReminders();
  });

  // Check every minute for day-before reminders (but only sends at 3 PM)
  cron.schedule("* * * * *", async () => {
    await checkDayBeforeReminders();
  });

  console.log("✅ Cron scheduler started with FCM/APNs");
  console.log("   - Day-before reminders: Every day at 3 PM");
  console.log("   - 2-hour-before reminders: Checking every minute");
}