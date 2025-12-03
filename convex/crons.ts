import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Schedule reminder checks to run daily at 9:00 AM UTC
// This will check for subscriptions renewing tomorrow and money lent due tomorrow
crons.daily(
  "daily reminder notifications",
  { hourUTC: 9, minuteUTC: 0 },
  internal.reminders.scheduledReminders
);

export default crons;
