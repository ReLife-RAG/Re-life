import { Request, Response } from 'express';
import * as counselorService from '../services/Counselor.service';

// 13.1 Create Counselor Profile
export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { specializations, credentials, bio, price, availability } = req.body;
    
    const counselor = await counselorService.createCounselorProfile(userId, {
      specializations,
      credentials,
      bio,
      price,
      availability
    });
    
    res.status(201).json({
      success: true,
      message: 'Counselor profile created successfully',
      data: counselor
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 13.2 Get All Counselors
export const getAllCounselors = async (req: Request, res: Response) => {
  try {
    const { specialization, availability, sort } = req.query;
    
    const filters = {
      specialization: specialization as string,
      availability: availability as string,
      sort: sort as string
    };
    
    const counselors = await counselorService.getAllCounselors(filters);
    
    res.json({
      success: true,
      count: counselors.length,
      data: counselors
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 13.3 Get Single Counselor
export const getCounselor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const counselor = await counselorService.getCounselorById(id);
    
    res.json({
      success: true,
      data: counselor
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// 13.4 Update Counselor Profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { id } = req.params;
    
    const counselor = await counselorService.updateCounselorProfile(
      id,
      userId,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: counselor
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 14.1 Create Booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { counselorId, sessionDate, sessionTime } = req.body;
    
    const session = await counselorService.createBooking(userId, {
      counselorId,
      sessionDate,
      sessionTime
    });
    
    res.status(201).json({
      success: true,
      message: 'Session booked successfully',
      data: session
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 14.2 Get User's Sessions
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { status } = req.query;
    
    const sessions = await counselorService.getUserSessions(
      userId,
      status as string
    );
    
    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 14.3 Get Counselor's Sessions
export const getCounselorSessions = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { status } = req.query;
    
    const sessions = await counselorService.getCounselorSessions(
      userId,
      status as string
    );
    
    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 14.4 Cancel Session
export const cancelSession = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { id } = req.params;
    const { reason } = req.body;
    
    const session = await counselorService.cancelSession(id, userId, reason);
    
    res.json({
      success: true,
      message: 'Session cancelled successfully',
      data: session
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 14.5 Complete Session
export const completeSession = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Temporary - replace with real user ID later
    const { id } = req.params;
    const { sessionNotes } = req.body;
    
    const session = await counselorService.completeSession(
      id,
      userId,
      sessionNotes
    );
    
    res.json({
      success: true,
      message: 'Session completed successfully',
      data: session
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};