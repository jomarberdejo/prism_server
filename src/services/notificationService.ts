import cron from "node-cron";
import { Expo } from "expo-server-sdk";
import { isTomorrow, subDays, startOfDay, endOfDay } from "date-fns";
import { ppaRepository } from "@/data/ppa";

const expo = new Expo();
const sentReminders = new Set<string>();

async function sendPushNotification(
  id: string,
  pushToken: string,
  title: string,
  body: string
) {
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

    await ppaRepository.update(id, {
      lastNotifiedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return false;
  }
}

async function checkUpcomingPPAs() {
  const ppas = await ppaRepository.findAllWithNoNotified();

  for (const ppa of ppas) {
    if (!ppa.startDate) continue;

    const startDate = new Date(ppa.startDate);

    if (!isTomorrow(startDate)) continue;

    const reminderKey = `${ppa.id}-tomorrow`;
    if (sentReminders.has(reminderKey)) continue;

    const success = await sendPushNotification(
      ppa.id,
      "ExponentPushToken[eRawYMG-CSemOXAVYYNJfl]",
      `📅 Reminder: ${ppa.task} starts tomorrow!`,
      `It begins at ${startDate.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
      })}`
    );

    if (success) {
      sentReminders.add(reminderKey);
      console.log(`✅ Sent reminder for PPA: ${ppa.task}`);
    }
  }
}

export function startCronScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking for PPAs starting tomorrow...");
    await checkUpcomingPPAs();
  });

  console.log("✅ Cron scheduler started (runs every 1 minute)");
}
