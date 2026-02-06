/**
 * Streak Calculation Utility
 * Handles streak logic with timezone support for global users
 */

interface StreakCalculationResult {
  isConsecutive: boolean;
  shouldResetStreak: boolean;
  alreadyCheckedInToday: boolean;
}

/**
 * Calculate streak status based on last check-in date
 * @param lastCheckIn - User's last check-in date
 * @param userTimezone - User's timezone (e.g., "America/New_York", "Asia/Kolkata")
 * @returns Streak calculation result
 */
export function calculateStreak(
  lastCheckIn: Date | null,
  userTimezone: string = 'UTC'
): StreakCalculationResult {
  // Get current date in user's timezone
  const todayInUserTZ = getTodayInTimezone(userTimezone);
  
  // If no previous check-in, this is first check-in
  if (!lastCheckIn) {
    return {
      isConsecutive: false,
      shouldResetStreak: false,
      alreadyCheckedInToday: false
    };
  }

  // Convert last check-in to user's timezone
  const lastCheckInUserTZ = getDateInTimezone(lastCheckIn, userTimezone);

  // Check if already checked in today
  if (isSameDay(lastCheckInUserTZ, todayInUserTZ)) {
    return {
      isConsecutive: false,
      shouldResetStreak: false,
      alreadyCheckedInToday: true
    };
  }

  // Calculate yesterday in user's timezone
  const yesterdayInUserTZ = new Date(todayInUserTZ);
  yesterdayInUserTZ.setDate(yesterdayInUserTZ.getDate() - 1);

  // Check if last check-in was yesterday (consecutive day)
  const isConsecutive = isSameDay(lastCheckInUserTZ, yesterdayInUserTZ);

  return {
    isConsecutive,
    shouldResetStreak: !isConsecutive,
    alreadyCheckedInToday: false
  };
}

/**
 * Get current date at midnight in specified timezone
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Date object at midnight in specified timezone
 */
function getTodayInTimezone(timezone: string): Date {
  const now = new Date();
  
  // Create date string in user's timezone
  const dateString = now.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Parse and return date at midnight
  const [month, day, year] = dateString.split(/[/,\s]+/);
  const dateInTZ = new Date(Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    0, 0, 0, 0
  ));

  return dateInTZ;
}

/**
 * Convert a date to midnight in specified timezone
 * @param date - Date to convert
 * @param timezone - IANA timezone string
 * @returns Date at midnight in specified timezone
 */
function getDateInTimezone(date: Date, timezone: string): Date {
  const dateString = date.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const [month, day, year] = dateString.split(/[/,\s]+/);
  const dateInTZ = new Date(Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    0, 0, 0, 0
  ));

  return dateInTZ;
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Validate timezone string
 * @param timezone - IANA timezone string to validate
 * @returns True if valid timezone
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get default timezone (UTC) if user timezone is invalid
 * @param userTimezone - User's preferred timezone
 * @returns Valid timezone string
 */
export function getSafeTimezone(userTimezone?: string): string {
  if (!userTimezone) return 'UTC';
  return isValidTimezone(userTimezone) ? userTimezone : 'UTC';
}
