import Booking, { IBooking } from '../models/Booking';
import { CounselorService } from './counselor.service';
import User from '../models/User';

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(data: {
    userId: string;
    counselorId: string;
    slotStart: Date;
    slotEnd: Date;
    fee: number;
    notes?: string;
  }): Promise<IBooking> {
    // Validate slot is available
    const isAvailable = await CounselorService.isSlotAvailable(
      data.counselorId,
      data.slotStart,
      data.slotEnd
    );

    if (!isAvailable) {
      throw { status: 409, message: 'Selected slot is not available' };
    }

    // Check slot is in the future
    if (new Date() > data.slotStart) {
      throw { status: 400, message: 'Cannot book a slot in the past' };
    }

    // Verify user exists
    const user = await User.findById(data.userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Mark slot as booked
    await CounselorService.markSlotAsBooked(
      data.counselorId,
      data.slotStart,
      data.slotEnd
    );

    // Create booking
    const booking = new Booking({
      userId: data.userId,
      counselorId: data.counselorId,
      slotStart: data.slotStart,
      slotEnd: data.slotEnd,
      fee: data.fee,
      notes: data.notes,
      status: 'confirmed',
    });

    await booking.save();
    return booking;
  }

  /**
   * Get all bookings for a user
   */
  static async getUserBookings(userId: string) {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid user ID format' };
    }

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate('counselorId', 'bio rating totalSessions')
      .populate('userId', 'name email');

    return bookings;
  }

  /**
   * Get a single booking by ID
   */
  static async getBookingById(bookingId: string, userId?: string) {
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid booking ID format' };
    }

    // First, find the booking regardless of ownership
    const booking = await Booking.findOne({ _id: bookingId })
      .populate('counselorId', 'bio rating totalSessions')
      .populate('userId', 'name email');

    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }

    // Then check ownership if userId is provided
    if (userId && booking.userId._id.toString() !== userId) {
      throw { status: 403, message: 'You can only view your own bookings' };
    }

    return booking;
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(
    bookingId: string,
    userId: string,
    cancellationReason?: string
  ): Promise<IBooking> {
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid booking ID format' };
    }

    // First find the booking regardless of ownership (without populating)
    const booking = await Booking.findOne({ _id: bookingId });

    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }

    // Check ownership
    if (booking.userId.toString() !== userId) {
      throw { status: 403, message: 'You can only cancel your own bookings' };
    }

    if (booking.status === 'cancelled') {
      throw { status: 400, message: 'Booking is already cancelled' };
    }

    // Free up the slot using the raw counselorId
    await CounselorService.markSlotAsAvailable(
      booking.counselorId.toString(),
      booking.slotStart,
      booking.slotEnd
    );

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Return populated version for response
    const populatedBooking = await Booking.findById(bookingId)
      .populate('counselorId', 'bio rating totalSessions')
      .populate('userId', 'name email');

    return populatedBooking!;
  }

  /**
   * Get counselor's bookings
   */
  static async getCounselorBookings(
    counselorId: string,
    status?: string
  ) {
    if (!counselorId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid counselor ID format' };
    }

    const query: any = { counselorId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ slotStart: 1 })
      .populate('userId', 'name email');

    return bookings;
  }
}
