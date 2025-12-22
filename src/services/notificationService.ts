import cron from "node-cron";
import { Expo } from "expo-server-sdk";
import { isTomorrow, isToday, differenceInMinutes } from "date-fns";
import { ppaRepository } from "@/data/ppa";
import { formatDate, formatTime } from "@/utils/dates";

const expo = new Expo();

const sentReminders = new Set<string>();

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
  if (!Expo.isExpoPushToken(pushToken)) {
    console.warn(`❌ Invalid Expo push token: ${pushToken}`);
    return false;
  }

  try {
    const tickets = await expo.sendPushNotificationsAsync([
      {
        to: pushToken,
        sound: "default",
        title,
        body,
        priority: "high",
        channelId: "default",
      },
    ]);
    console.log("✅ Notification sent:", tickets);

    if (notificationType === "day_before") {
      await ppaRepository.update(ppaId, {
        dayBeforeNotifiedAt: new Date(),
      });
    } else {
      await ppaRepository.update(ppaId, {
        hourBeforeNotifiedAt: new Date(),
      });
    }

    return true;
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
  
  // Only run at 3 PM (15:00)
  if (currentHour !== 15 || now.getMinutes() !== 0) {
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

    const success = await sendPushNotification({
      ppaId: ppa.id,
      pushToken: "ExponentPushToken[lzoMsoOhleB0ONO51amrul]",
      title: `📅 Reminder: ${ppa.task} starts tomorrow!`,
      body: `It begins at ${formatTime(ppa.startDate)} and ends on ${formatDate(ppa.dueDate)} at ${formatTime(ppa.dueTime)}. Don't forget to prepare!`,
      notificationType: "day_before",
    });

    if (success) {
      sentReminders.add(reminderKey);
      console.log(`✅ Sent day-before reminder for PPA: ${ppa.task}`);
    }
  }
}

/**
 * Check for PPAs starting in 1 hour and send reminder
 * This runs every minute and checks if start time is approaching
 */
async function checkHourBeforeReminders() {
  console.log("⏰ Checking for PPAs starting in 1 hour...");
  
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

    // Send notification if event starts in 55-65 minutes (1 hour window with buffer)
    if (minutesUntilStart < 55 || minutesUntilStart > 65) continue;

    const reminderKey = `${ppa.id}-hour-before`;
    if (sentReminders.has(reminderKey)) continue;

    const success = await sendPushNotification({
      ppaId: ppa.id,
      pushToken: "ExponentPushToken[lzoMsoOhleB0ONO51amrul]",
      title: `⏰ Starting Soon: ${ppa.task}`,
      body: `Your event starts in about 1 hour at ${formatTime(ppa.startTime)}. Location: ${ppa.venue || ppa.address}`,
      notificationType: "hour_before",
    });

    if (success) {
      sentReminders.add(reminderKey);
      console.log(`✅ Sent hour-before reminder for PPA: ${ppa.task}`);
    }
  }
}

export async function remindReschedulePPA({
  ppaId,
  title,
  body,
}: {
  ppaId: string;
  title: string;
  body: string;
}) {
  const data = {
    ppaId,
    pushToken: "ExponentPushToken[lzoMsoOhleB0ONO51amrul]",
    title: `${title}`,
    body: `${body}`,
    notificationType: "day_before" as const,
  };
  const success = await sendPushNotification(data);

  console.log("RESCHEDULE NOTIFICATION SENT:", success);
}



export function startCronScheduler() {
  // Check every minute for hour-before reminders
  cron.schedule("* * * * *", async () => {
    await checkHourBeforeReminders();
  });

  // Check every minute for day-before reminders (but only sends at 3 PM)
  cron.schedule("* * * * *", async () => {
    await checkDayBeforeReminders();
  });

  console.log("✅ Cron scheduler started");
  console.log("   - Day-before reminders: Every day at 3 PM");
  console.log("   - Hour-before reminders: Checking every minute");
}