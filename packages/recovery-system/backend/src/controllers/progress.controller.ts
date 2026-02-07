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