import Counselor from "../models/Counselor";
import User from "../models/User";
import { Appointment, AppointmentStatus } from "../models/Appointment";

/* CREATE PROFILE */
export const createCounselorProfile = async (
  userId: string,
  data: any
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.role !== "counselor")
    throw new Error("User is not a counselor");

  const existing = await Counselor.findOne({ userId });
  if (existing) throw new Error("Profile already exists");

  const counselor = new Counselor({
    userId,
    ...data
  });

  await counselor.save();
  return counselor;
};

/* GET ALL */
export const getAllCounselors = async () => {
  return Counselor.find({ isActive: true })
    .populate("userId", "name email")
    .sort({ avergageRating: -1 });
};

/* GET ONE */
export const getCounselorById = async (id: string) => {
  const counselor = await Counselor.findById(id)
    .populate("userId", "name email")
    .populate("reviews.userId", "name");

  if (!counselor) throw new Error("Counselor not found");
  return counselor;
};

/* UPDATE */
export const updateCounselorProfile = async (
  counselorId: string,
  userId: string,
  data: any
) => {
  const counselor = await Counselor.findById(counselorId);
  if (!counselor) throw new Error("Profile not found");

  if (counselor.userId.toString() !== userId)
    throw new Error("Not allowed");

  Object.assign(counselor, data);
  await counselor.save();
  return counselor;
};

/* CREATE APPOINTMENT */
export const createAppointment = async (
  userId: string,
  data: any
) => {
  const counselor = await Counselor.findById(data.counselorId);
  if (!counselor) throw new Error("Counselor not found");

  const appointment = new Appointment({
    userId,
    counselorId: data.counselorId,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    appointmentDate: data.appointmentDate,
    paymentAmount: counselor.pricePersession
  });

  await appointment.save();
  return appointment;
};

/* GET USER APPOINTMENTS */
export const getUserAppointments = async (
  userId: string
) => {
  return Appointment.find({ userId })
    .populate("counselorId")
    .sort({ appointmentDate: 1 });
};

/* GET COUNSELOR APPOINTMENTS */
export const getCounselorAppointments = async (
  userId: string
) => {
  const counselor = await Counselor.findOne({ userId });
  if (!counselor) throw new Error("Profile not found");

  return Appointment.find({ counselorId: counselor._id })
    .populate("userId", "name email")
    .sort({ appointmentDate: 1 });
};

/* CANCEL */
export const cancelAppointment = async (
  appointmentId: string,
  userId: string
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  if (appointment.userId.toString() !== userId)
    throw new Error("Not allowed");

  appointment.status = AppointmentStatus.CANCELLED;
  appointment.CancelledBy = userId as any;

  await appointment.save();
  return appointment;
};

/* COMPLETE */
export const completeAppointment = async (
  appointmentId: string,
  userId: string,
  notes?: string
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const counselor = await Counselor.findById(
    appointment.counselorId
  );
  if (!counselor)
    throw new Error("Counselor not found");

  if (counselor.userId.toString() !== userId)
    throw new Error("Only counselor can complete");

  appointment.status = AppointmentStatus.COMPLETED;
  if (notes) appointment.counselorNotes = notes;

  await appointment.save();
  return appointment;
};
