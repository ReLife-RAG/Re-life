import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Progress from '../models/Progress';
import User from '../models/User';
import { calculateStreak, getSafeTimezone } from '../utils/streakCalculator';

// Step 3: Daily Check-in Logic
// POST /api/progress/checkin
export const dailyCheckIn = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 1. GET USER ID FROM AUTHENTICATION (Fixed)
    const userId = (req as any).user.id;
    const { mood, notes, energy } = req.body;

    // Validate required fields
    if (!mood) {
      return res.status(400).json({ 
        message: 'Mood is required for check-in' 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format.' 
      });
    }

    // Find or create progress document
    let progress = await Progress.findOne({ userId });

    if (!progress) {
      // First time check-in - create new progress
      progress = new Progress({
        userId,
        streak: 1,
        longestStreak: 1,
        lastCheckIn: new Date(),
        checkedInToday: true,
        moodLog: [{
          date: new Date(),
          mood,
          notes,
          energy
        }],
        milestones: [
          { name: 'First Step', targetDays: 1, achieved: true, achievedDate: new Date(), description: 'Completed your first check-in!' },
          { name: 'One Week Strong', targetDays: 7, achieved: false, description: '7 consecutive days' },
          { name: 'Two Weeks Champion', targetDays: 14, achieved: false, description: '14 consecutive days' },
          { name: 'One Month Warrior', targetDays: 30, achieved: false, description: '30 consecutive days' },
          { name: 'Three Months Hero', targetDays: 90, achieved: false, description: '90 consecutive days' },
          { name: 'Half Year Legend', targetDays: 180, achieved: false, description: '6 months of strength' },
          { name: 'One Year Master', targetDays: 365, achieved: false, description: 'A full year of recovery!' }
        ]
      });

      await progress.save();

      return res.status(201).json({
        message: 'First check-in complete! Your recovery journey starts now! 🎉',
        progress,
        isFirstCheckIn: true
      });
    }

    // Get user's timezone (fetch from User model or default to UTC)
    const user = await User.findById(userId).select('timezone');
    const userTimezone = getSafeTimezone(user?.timezone);

    // Calculate streak using utility function with timezone support
    // (Ensure lastCheckIn is a Date object)
    const lastCheckInDate = progress.lastCheckIn ? new Date(progress.lastCheckIn) : new Date();
    const streakResult = calculateStreak(lastCheckInDate, userTimezone);

    // Check if already checked in today
    if (streakResult.alreadyCheckedInToday) {
      return res.status(400).json({
        message: 'You have already checked in today! Come back tomorrow 🌟',
        progress
      });
    }

    // Update streak based on calculation
    if (streakResult.isConsecutive) {
      // Consecutive day - increment streak
      progress.streak += 1;
      
      // Update longest streak if current streak is higher
      if (progress.streak > progress.longestStreak) {
        progress.longestStreak = progress.streak;
      }
    } else if (streakResult.shouldResetStreak) {
      // Missed a day - reset streak to 1
      progress.streak = 1;
    }

    // Add mood log entry
    progress.moodLog.push({
      date: new Date(),
      mood,
      notes,
      energy
    });

    // Update check-in status
    progress.lastCheckIn = new Date();
    progress.checkedInToday = true;

    // Check and update milestones
    let newlyAchieved: any[] = [];
    progress.milestones.forEach((milestone) => {
      if (!milestone.achieved && progress.streak >= milestone.targetDays) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();
        newlyAchieved.push(milestone);
      }
    });

    await progress.save();

    // Build response message
    let message = `Check-in successful! 🔥 Current streak: ${progress.streak} days`;
    if (newlyAchieved.length > 0) {
      message = `🎉 Milestone Unlocked: ${newlyAchieved[0].name}! You're at ${progress.streak} days!`;
    }

    res.status(200).json({
      message,
      progress,
      newMilestones: newlyAchieved,
      streakContinued: streakResult.isConsecutive
    });

  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      message: 'Server error during check-in',
      error: error.message 
    });
  }
};

// GET /api/progress/streak
export const getStreak = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 2. GET USER ID FROM AUTHENTICATION (Fixed)
    const userId = (req as any).user.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        message: 'No progress found. Start your journey with a check-in!',
        currentStreak: 0,
        longestStreak: 0
      });
    }

    res.status(200).json({
      currentStreak: progress.streak,
      longestStreak: progress.longestStreak,
      lastCheckIn: progress.lastCheckIn,
      checkedInToday: progress.checkedInToday,
      milestones: progress.milestones.filter(m => m.achieved)
    });

  } catch (error: any) {
    console.error('Get streak error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// GET /api/progress/mood-history
export const getMoodHistory = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 3. GET USER ID FROM AUTHENTICATION (Fixed)
    const userId = (req as any).user.id;
    const { days } = req.query; // Optional: filter last N days

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        message: 'No progress found',
        moodLog: []
      });
    }

    let moodLog = progress.moodLog;

    // Filter by days if provided
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - Number(days));
      moodLog = moodLog.filter(entry => entry.date >= cutoffDate);
    }

    res.status(200).json({
      moodLog: moodLog.sort((a, b) => b.date.getTime() - a.date.getTime()), // Newest first
      totalEntries: moodLog.length
    });

  } catch (error: any) {
    console.error('Get mood history error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Step 8: Mood Tracking System
// 8.1 POST /api/progress/mood - Log Mood Entry
export const logMood = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = (req as any).user.id;
    const { score, notes } = req.body;

    // Validate mood score (1-10)
    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'Mood score is required' });
    }

    const moodScore = Number(score);
    if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10) {
      return res.status(400).json({ message: 'Mood score must be an integer between 1 and 10' });
    }

    // Validate optional notes field
    if (notes !== undefined && typeof notes !== 'string') {
      return res.status(400).json({ message: 'Notes must be a string' });
    }
    if (notes && notes.length > 500) {
      return res.status(400).json({ message: 'Notes must be 500 characters or less' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Map numeric score to mood label
    const moodMap: Record<number, 'great' | 'good' | 'okay' | 'struggling' | 'relapsed'> = {
      9: 'great', 10: 'great',
      7: 'good', 8: 'good',
      5: 'okay', 6: 'okay',
      3: 'struggling', 4: 'struggling',
      1: 'relapsed', 2: 'relapsed'
    };
    const moodLabel = moodMap[moodScore];

    let progress = await Progress.findOne({ userId });

    if (!progress) {
      // Create new progress record with streak + check-in for first-time users
      progress = new Progress({
        userId,
        streak: 1,
        longestStreak: 1,
        lastCheckIn: new Date(),
        checkedInToday: true,
        moodLog: [{
          date: new Date(),
          mood: moodLabel,
          notes,
          energy: moodScore
        }],
        milestones: [
          { name: 'First Step', targetDays: 1, achieved: true, achievedDate: new Date(), description: 'Completed your first check-in!' },
          { name: 'One Week Strong', targetDays: 7, achieved: false, description: '7 consecutive days' },
          { name: 'Two Weeks Champion', targetDays: 14, achieved: false, description: '14 consecutive days' },
          { name: 'One Month Warrior', targetDays: 30, achieved: false, description: '30 consecutive days' },
          { name: 'Three Months Hero', targetDays: 90, achieved: false, description: '90 consecutive days' },
          { name: 'Half Year Legend', targetDays: 180, achieved: false, description: '6 months of strength' },
          { name: 'One Year Master', targetDays: 365, achieved: false, description: 'A full year of recovery!' }
        ]
      });
    } else {
      // Save mood entry to existing progress record
      progress.moodLog.push({
        date: new Date(),
        mood: moodLabel,
        notes,
        energy: moodScore
      });
    }

    await progress.save();

    return res.status(201).json({
      message: 'Mood entry logged successfully',
      entry: {
        date: progress.moodLog[progress.moodLog.length - 1].date,
        score: moodScore,
        mood: moodLabel,
        notes
      }
    });

  } catch (error: any) {
    console.error('Log mood error:', error);
    return res.status(500).json({
      message: 'Server error while logging mood',
      error: error.message
    });
  }
};

// 8.2 GET /api/progress/mood - Get Mood History
export const getMoodData = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = (req as any).user.id;
    const { startDate, endDate, days } = req.query;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        message: 'No mood data found. Start by logging a mood entry!',
        entries: [],
        averageScore: 0,
        totalEntries: 0
      });
    }

    let entries = progress.moodLog;

    // Support date range filtering
    if (startDate) {
      const start = new Date(startDate as string);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid startDate format. Use YYYY-MM-DD.' });
      }
      entries = entries.filter(e => e.date >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format. Use YYYY-MM-DD.' });
      }
      // Include the full end day
      end.setHours(23, 59, 59, 999);
      entries = entries.filter(e => e.date <= end);
    }

    // Also support "last N days" shorthand
    if (days) {
      const numDays = Number(days);
      if (isNaN(numDays) || numDays < 1) {
        return res.status(400).json({ message: 'days must be a positive number' });
      }
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - numDays);
      entries = entries.filter(e => e.date >= cutoff);
    }

    // Sort newest first
    const sorted = entries.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate average mood score (energy field holds 1-10 score)
    const scoresWithValues = sorted.filter(e => e.energy != null);
    const averageScore = scoresWithValues.length > 0
      ? Math.round((scoresWithValues.reduce((sum, e) => sum + (e.energy || 0), 0) / scoresWithValues.length) * 10) / 10
      : 0;

    return res.status(200).json({
      entries: sorted.map(e => ({
        date: e.date,
        mood: e.mood,
        score: e.energy || null,
        notes: e.notes
      })),
      averageScore,
      totalEntries: sorted.length
    });

  } catch (error: any) {
    console.error('Get mood data error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// 8.3 GET /api/progress/mood/analytics - Mood Analytics
export const getMoodAnalytics = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = (req as any).user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress || progress.moodLog.length === 0) {
      return res.status(404).json({
        message: 'No mood data found for analytics',
        trends: { sevenDay: null, thirtyDay: null },
        patterns: {},
        totalEntries: 0
      });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const last7 = progress.moodLog.filter(e => e.date >= sevenDaysAgo);
    const last30 = progress.moodLog.filter(e => e.date >= thirtyDaysAgo);

    // Helper: calculate average score from entries
    const avg = (entries: typeof progress.moodLog) => {
      const withScore = entries.filter(e => e.energy != null);
      if (withScore.length === 0) return null;
      return Math.round((withScore.reduce((s, e) => s + (e.energy || 0), 0) / withScore.length) * 10) / 10;
    };

    const sevenDayAvg = avg(last7);
    const thirtyDayAvg = avg(last30);

    // Trend direction: compare 7-day to 30-day
    let trendDirection: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data';
    if (sevenDayAvg !== null && thirtyDayAvg !== null) {
      const diff = sevenDayAvg - thirtyDayAvg;
      if (diff > 0.5) trendDirection = 'improving';
      else if (diff < -0.5) trendDirection = 'declining';
      else trendDirection = 'stable';
    }

    // Mood distribution across all entries
    const moodDistribution: Record<string, number> = {};
    progress.moodLog.forEach(e => {
      moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1;
    });

    // Identify most frequent mood
    const mostFrequentMood = Object.entries(moodDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Day-of-week patterns (0=Sunday, 6=Saturday)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayScores: Record<string, { total: number; count: number }> = {};
    dayNames.forEach(d => { dayScores[d] = { total: 0, count: 0 }; });

    progress.moodLog.forEach(e => {
      if (e.energy != null) {
        const dayName = dayNames[e.date.getDay()];
        dayScores[dayName].total += e.energy;
        dayScores[dayName].count += 1;
      }
    });

    const dayOfWeekAverages: Record<string, number | null> = {};
    dayNames.forEach(d => {
      dayOfWeekAverages[d] = dayScores[d].count > 0
        ? Math.round((dayScores[d].total / dayScores[d].count) * 10) / 10
        : null;
    });

    // Best and worst days
    const activeDays = Object.entries(dayOfWeekAverages).filter(([, v]) => v !== null) as [string, number][];
    const bestDay = activeDays.sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const worstDay = activeDays.sort((a, b) => a[1] - b[1])[0]?.[0] || null;

    return res.status(200).json({
      trends: {
        sevenDay: { average: sevenDayAvg, entries: last7.length },
        thirtyDay: { average: thirtyDayAvg, entries: last30.length },
        direction: trendDirection
      },
      patterns: {
        moodDistribution,
        mostFrequentMood,
        dayOfWeekAverages,
        bestDay,
        worstDay
      },
      totalEntries: progress.moodLog.length
    });

  } catch (error: any) {
    console.error('Mood analytics error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// GET /api/progress/history
// 7.4 Get Streak History - Calendar visualization format
export const getHistory = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = (req as any).user.id;
    const { days } = req.query; // Optional: filter last N days (default: 90)
    const filterDays = days ? Number(days) : 90;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        message: 'No check-in history found',
        dates: [],
        calendar: {},
        stats: { totalCheckIns: 0, currentStreak: 0, longestStreak: 0 }
      });
    }

    // Filter mood log by days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    const filteredLog = progress.moodLog.filter(entry => entry.date >= cutoffDate);

    // Format data for calendar visualization
    const dates: string[] = [];
    const calendar: Record<string, { mood: string; hasCheckIn: boolean; notes?: string; energy?: number }> = {};

    filteredLog.forEach(entry => {
      // Format date as YYYY-MM-DD
      const dateKey = entry.date.toISOString().split('T')[0];
      
      dates.push(dateKey);
      calendar[dateKey] = {
        mood: entry.mood,
        hasCheckIn: true,
        notes: entry.notes,
        energy: entry.energy
      };
    });

    // Get unique sorted dates
    const uniqueDates = [...new Set(dates)].sort();

    res.status(200).json({
      dates: uniqueDates,
      calendar,
      stats: {
        totalCheckIns: filteredLog.length,
        currentStreak: progress.streak,
        longestStreak: progress.longestStreak,
        lastCheckIn: progress.lastCheckIn
      }
    });

  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};