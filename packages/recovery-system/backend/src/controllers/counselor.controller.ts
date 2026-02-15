import { Request, Response } from "express";
import * as counselorService from "../services/Counselor.service";

/* =============================
   13. COUNSELOR PROFILE
============================= */

// Create Counselor Profile
export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id"; // Replace with auth later

    const {
      specialization,
      qualifaicaton,
      bio,
      pricePersession,
      availableSlots
    } = req.body;

    const counselor = await counselorService.createCounselorProfile(
      userId,
      {
        specialization,
        qualifaicaton,
        bio,
        pricePersession,
        availableSlots
      }
    );

    res.status(201).json({
      success: true,
      message: "Counselor profile created successfully",
      data: counselor
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Counselors
export const getAllCounselors = async (_req: Request, res: Response) => {
  try {
    const counselors = await counselorService.getAllCounselors();

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

// Get Single Counselor
export const getCounselor = async (req: Request, res: Response) => {
  try {
    const counselor = await counselorService.getCounselorById(
      req.params.id
    );

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

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = "temp-user-id";

    const counselor = await counselorService.updateCounselorProfile(
      req.params.id,
      userId,
      req.body
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: counselor
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* =============================
   14. APPOINTMENTS
============================= */

// Create Appointment
export const createAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = "temp-user-id";

    const appointment =
      await counselorService.createAppointment(
        userId,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Appointments
export const getUserAppointments = async (
  _req: Request,
  res: Response
) => {
  try {
    const userId = "temp-user-id";

    const appointments =
      await counselorService.getUserAppointments(userId);

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Counselor Appointments
export const getCounselorAppointments = async (
  _req: Request,
  res: Response
) => {
  try {
    const userId = "temp-user-id";

    const appointments =
      await counselorService.getCounselorAppointments(userId);

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel Appointment
export const cancelAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = "temp-user-id";

    const appointment =
      await counselorService.cancelAppointment(
        req.params.id,
        userId
      );

    res.json({
      success: true,
      message: "Appointment cancelled",
      data: appointment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Complete Appointment
export const completeAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = "temp-user-id";

    const appointment =
      await counselorService.completeAppointment(
        req.params.id,
        userId,
        req.body.notes
      );

    res.json({
      success: true,
      message: "Appointment completed",
      data: appointment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
