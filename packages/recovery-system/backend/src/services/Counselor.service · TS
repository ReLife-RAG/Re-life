import Counselor from "../models/Counselor";
import User from "../models/User";
import Session from "../models/Session";


// ===================================================
// COUNSELOR PROFILE SECTION
// ===================================================

// Create Counselor Profile
export const createCounselorProfile = async (userId: string, data: any) => {

  const user = await User.findById(userId);

  // Check role
  if (!user || user.role !== "counselor") {
    throw new Error("User is not a counselor");
  }

  // Prevent duplicate profile
  const oldProfile = await Counselor.findOne({ userId });
  if (oldProfile) {
    throw new Error("Profile already exists");
  }

  // Basic validation
  if (!data.credentials || data.credentials.length === 0)
    throw new Error("Need at least one credential");

  if (!data.specializations || data.specializations.length === 0)
    throw new Error("Need at least one specialization");

  const counselor = new Counselor({
    userId: userId,
    specialization: data.specializations,
    qualifaicaton: data.credentials,
    bio: data.bio,
    pricePersession: data.price,
    availableSlots: data.availability || []
  });

  await counselor.save();
  return counselor;
};


// Get All Counselors
export const getAllCounselors = async (filters: any = {}) => {

  let query: any = { isActive: true };

  if (filters.specialization) {
    query.specialization = filters.specialization;
  }

  if (filters.availability === "true") {
    query["availableSlots.isBooked"] = false;
  }

  let sortOption: any = { createdAt: -1 };

  if (filters.sort === "rating") sortOption = { avergageRating: -1 };
  if (filters.sort === "price-low") sortOption = { pricePersession: 1 };
  if (filters.sort === "price-high") sortOption = { pricePersession: -1 };

  return await Counselor.find(query)
    .populate("userId", "name email")
    .sort(sortOption);
};


// Get One Counselor
export const getCounselorById = async (id: string) => {

  const counselor = await Counselor.findById(id)
    .populate("userId", "name email")
    .populate("reviews.UserId", "name");

  if (!counselor) throw new Error("Counselor not found");

  return counselor;
};


// Update Counselor Profile
export const updateCounselorProfile = async (
  counselorId: string,
  userId: string,
  updates: any
) => {

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) throw new Error("Profile not found");

  if (counselor.userId.toString() !== userId)
    throw new Error("You cannot edit this profile");

  if (updates.specializations && updates.specializations.length === 0)
    throw new Error("Need at least one specialization");

  if (updates.credentials && updates.credentials.length === 0)
    throw new Error("Need at least one credential");

  if (updates.price && updates.price < 0)
    throw new Error("Price cannot be negative");

  if (updates.specializations) counselor.specialization = updates.specializations;
  if (updates.credentials) counselor.qualifaicaton = updates.credentials;
  if (updates.bio) counselor.bio = updates.bio;
  if (updates.price) counselor.pricePersession = updates.price;
  if (updates.availability) counselor.availableSlots = updates.availability;
  if (updates.isActive !== undefined) counselor.isActive = updates.isActive;

  await counselor.save();
  return counselor;
};



// ===================================================
// SESSION BOOKING SECTION
// ===================================================

// Book Session
export const createBooking = async (userId: string, data: any) => {

  const { counselorId, sessionDate, sessionTime } = data;

  const date = new Date(sessionDate);
  if (date < new Date()) throw new Error("Cannot book past date");

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) throw new Error("Counselor not found");

  const slot = counselor.availableSlots.find(
    (s: any) => !s.isBooked && s.startTime === sessionTime
  );

  if (!slot) throw new Error("Time slot not available");

  const session = new Session({
    userId,
    counselorId,
    sessionDate: date,
    sessionTime: new Date(`${sessionDate}T${sessionTime}`),
    amount: counselor.pricePersession,
    status: "SCHEDULED"
  });

  await session.save();

  slot.isBooked = true;
  await counselor.save();

  return session;
};


// Get User Sessions
export const getUserSessions = async (userId: string, status?: string) => {

  let query: any = { userId };
  if (status) query.status = status.toUpperCase();

  return await Session.find(query)
    .populate("counselorId")
    .populate("userId", "name email")
    .sort({ sessionDate: 1 });
};


// Get Counselor Sessions
export const getCounselorSessions = async (userId: string, status?: string) => {

  const counselor = await Counselor.findOne({ userId });
  if (!counselor) throw new Error("Profile not found");

  let query: any = { counselorId: counselor._id };
  if (status) query.status = status.toUpperCase();

  return await Session.find(query)
    .populate("userId", "name email")
    .populate("counselorId")
    .sort({ sessionDate: 1 });
};


// Cancel Session
export const cancelSession = async (sessionId: string, userId: string, reason?: string) => {

  const session = await Session.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const counselor = await Counselor.findById(session.counselorId);

  const isUser = session.userId.toString() === userId;
  const isCounselor = counselor?.userId.toString() === userId;

  if (!isUser && !isCounselor)
    throw new Error("You are not part of this session");

  if (session.status === "COMPLETED")
    throw new Error("Cannot cancel completed session");

  session.status = "CANCELLED";
  if (reason) session.CancelSession = reason;
  session.CancelledBy = userId as any;

  await session.save();

  if (counselor) {
    const slot = counselor.availableSlots.find(
      (s: any) => s.startTime === session.sessionTime.toTimeString().substring(0, 5)
    );
    if (slot) slot.isBooked = false;
    await counselor.save();
  }

  return session;
};


// Complete Session
export const completeSession = async (
  sessionId: string,
  userId: string,
  notes?: string
) => {

  const session = await Session.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const counselor = await Counselor.findById(session.counselorId);
  if (!counselor || counselor.userId.toString() !== userId)
    throw new Error("Only counselor can complete session");

  session.status = "COMPLETED";
  if (notes) session.sessionNotes = notes;

  await session.save();
  return session;
};
