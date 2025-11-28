import cron from "node-cron";
import { Expo } from "expo-server-sdk";
import { isTomorrow } from "date-fns";
import { ppaRepository } from "@/data/ppa";
import { formatDate, formatTime } from "@/utils/dates";

const expo = new Expo();
const sentReminders = new Set<string>();

async function sendPushNotification({
  ppaId,
  pushToken,
  title,
  body,
}: {
  ppaId?: string;
  pushToken: string;
  title: string;
  body: string;
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

    await ppaRepository.update(ppaId as string, {
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

    const success = await sendPushNotification({
      ppaId: ppa.id,
      pushToken: "ExponentPushToken[wNGmf-KRx9kYapx0ufw7Su]",
      title: `📅 Reminder: ${ppa.task} starts tomorrow!`,
      body: `It begins at ${formatTime(ppa.startDate)} and ends on ${formatDate(ppa.dueDate)} at ${formatTime(ppa.dueTime)}. Don't forget to prepare!`,
    });

    if (success) {
      sentReminders.add(reminderKey);
      console.log(`✅ Sent reminder for PPA: ${ppa.task}`);
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
    pushToken: "ExponentPushToken[wNGmf-KRx9kYapx0ufw7Su]",
    title: `${title}`,
    body: `${body}`,
  };
  const success = await sendPushNotification(data);

  console.log("RESCHEDULE NOTIFICATION SENT:", success);
}

export function startCronScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking for PPAs starting tomorrow...");
    await checkUpcomingPPAs();
  });

  console.log("✅ Cron scheduler started (runs every 1 minute)");
}
