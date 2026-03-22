import { calculateStreak, getSafeTimezone, isValidTimezone } from '../streakCalculator';

describe('streakCalculator', () => {
  test('returns first-checkin state when lastCheckIn is null', () => {
    const result = calculateStreak(null, 'UTC');
    expect(result).toEqual({
      isConsecutive: false,
      shouldResetStreak: false,
      alreadyCheckedInToday: false,
    });
  });

  test('marks already checked in today', () => {
    const now = new Date();
    const result = calculateStreak(now, 'UTC');

    expect(result.alreadyCheckedInToday).toBe(true);
    expect(result.shouldResetStreak).toBe(false);
  });

  test('marks consecutive when last check-in was yesterday', () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const result = calculateStreak(yesterday, 'UTC');
    expect(result).toEqual({
      isConsecutive: true,
      shouldResetStreak: false,
      alreadyCheckedInToday: false,
    });
  });

  test('marks reset when last check-in is older than yesterday', () => {
    const oldDate = new Date();
    oldDate.setUTCDate(oldDate.getUTCDate() - 3);

    const result = calculateStreak(oldDate, 'UTC');
    expect(result.isConsecutive).toBe(false);
    expect(result.shouldResetStreak).toBe(true);
    expect(result.alreadyCheckedInToday).toBe(false);
  });

  test('timezone helpers validate and sanitize safely', () => {
    expect(isValidTimezone('UTC')).toBe(true);
    expect(isValidTimezone('Invalid/Zone')).toBe(false);
    expect(getSafeTimezone('UTC')).toBe('UTC');
    expect(getSafeTimezone('Invalid/Zone')).toBe('UTC');
    expect(getSafeTimezone()).toBe('UTC');
  });
});
