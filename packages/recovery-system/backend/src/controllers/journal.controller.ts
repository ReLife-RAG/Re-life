import { Request, Response } from 'express';
import Journal from '../models/Journal';
import mongoose from 'mongoose';

export const createEntry = async (req: Request, res: Response) => {
  try {
    // GET USER ID FROM AUTHENTICATION (like progress controller)
    const userId = (req as any).user.id;
    const { content, mood, triggers, copingStrategies, isPrivate } = req.body;

// Validation
    if (!content || !mood) {
      return res.status(400).json({ message: 'Content and mood are required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const imageUrl = req.file ? req.file.path : undefined;

    // Parse arrays from form-data strings
    const parsedTriggers = typeof triggers === 'string' ? JSON.parse(triggers) : triggers || [];
    const parsedCopingStrategies = typeof copingStrategies === 'string' ? JSON.parse(copingStrategies) : copingStrategies || [];

    const newJournal = new Journal({
      user: userId,
      content,
      mood,
      triggers: parsedTriggers, 
      copingStrategies: parsedCopingStrategies,
      image: imageUrl,
      isPrivate: isPrivate === 'true' || isPrivate === true 
    });

    const savedEntry = await newJournal.save();
    res.status(201).json(savedEntry);

  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ message: 'Failed to create journal', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getEntries = async (req: Request, res: Response) => {
  try {
    // GET USER ID FROM AUTHENTICATION (like progress controller)
    const userId = (req as any).user.id;
    const { date, page = '1', limit = '10' } = req.query;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    let query: any = { user: userId };

    // Proper date filtering (full day range)
    if (date && typeof date === 'string') {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const entries = await Journal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await Journal.countDocuments(query);

    res.status(200).json({
      entries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({ message: 'Failed to fetch journals', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
export const getEntryById = async (req: Request, res: Response) => {
  try {
    // GET USER ID FROM AUTHENTICATION (like progress controller)
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const entry = await Journal.findOne({ _id: id, user: userId });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ message: 'Failed to fetch entry', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateEntry = async (req: Request, res: Response) => {
  try {
    // GET USER ID FROM AUTHENTICATION (like progress controller)
    const userId = (req as any).user.id;
    const { content, mood, triggers, copingStrategies, isPrivate } = req.body;
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const entry = await Journal.findOne({ _id: id, user: userId });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Update fields
    if (content) entry.content = content;
    if (mood) entry.mood = mood;
    if (triggers) entry.triggers = typeof triggers === 'string' ? JSON.parse(triggers) : triggers;
    if (copingStrategies) entry.copingStrategies = typeof copingStrategies === 'string' ? JSON.parse(copingStrategies) : copingStrategies;
    if (isPrivate !== undefined) entry.isPrivate = isPrivate === 'true' || isPrivate === true;
    
    // Handle new image upload
    if (req.file) {
      entry.image = req.file.path;
    }

    const updatedEntry = await entry.save();
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ message: 'Failed to update entry', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    // GET USER ID FROM AUTHENTICATION (like progress controller)
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const entry = await Journal.findOneAndDelete({ _id: id, user: userId });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ message: 'Failed to delete entry', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};