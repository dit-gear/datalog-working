import { subDays } from "date-fns";

function getDateBasedOnTime(): Date {
  // Get the current date and time
  const now = new Date();

  // Check if the current time is between 00:00 and 06:00
  if (now.getHours() >= 0 && now.getHours() < 6) {
    // It's between 00:00 and 06:00, return yesterday's date
    return subDays(now, 1);
  } else {
    // It's not between 00:00 and 06:00, return today's date
    return now;
  }
}
export default getDateBasedOnTime;
