import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { CounselorService } from '../services/counselor.service';

/**
 * POST /api/bookings
 * Create a new booking
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { counselorId, slotStart, slotEnd, notes } = req.body;
    let { fee } = req.body;

    // Validate required fields
    if (!counselorId || !slotStart || !slotEnd) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['counselorId', 'slotStart', 'slotEnd'],
      });
    }

    // Parse dates
    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'Slot start time must be before end time' });
    }

    // Auto-calculate fee from counselor's hourly rate if not provided
    if (fee === undefined) {
      const counselor = await CounselorService.getCounselorById(counselorId);
      if (!counselor) {
        return res.status(404).json({ error: 'Counselor not found' });
      }
      // Calculate fee based on hours (hourly rate * hours)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      fee = counselor.hourlyRate * hours;
    }

    // Validate fee if provided
    if (typeof fee !== 'number' || fee < 0) {
      return res.status(400).json({ error: 'Fee must be a non-negative number' });
    }

    // Create booking
    const booking = await BookingService.createBooking({
      userId,
      counselorId,
      slotStart: start,
      slotEnd: end,
      fee,
      notes,
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    if (error.status === 409) {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create booking' });
  }
};

/**
 * GET /api/bookings
 * Get all bookings for the logged-in user
 */
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const bookings = await BookingService.getUserBookings(userId);

    return res.status(200).json({
      message: 'Bookings retrieved successfully',
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

/**
 * GET /api/bookings/:id
 * Get a single booking
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const booking = await BookingService.getBookingById(id, userId);

    return res.status(200).json({
      message: 'Booking retrieved successfully',
      booking,
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.status === 403) {
      return res.status(403).json({ error: error.message });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await BookingService.cancelBooking(id, userId, cancellationReason);

    return res.status(200).json({
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.status === 403) {
      return res.status(403).json({ error: error.message });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    if (error.status === 409) {
      return res.status(409).json({ error: error.message });
    }

    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

/**
 * GET /api/counselors/:counselorId/available-slots
 * Get available slots for a counselor
 */
export const getCounselorAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { counselorId } = req.params;

    const slots = await CounselorService.getAvailableSlots(counselorId);

    return res.status(200).json({
      message: 'Available slots retrieved successfully',
      count: slots.length,
      slots,
    });
  } catch (error: any) {
    console.error('Error fetching available slots:', error);

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

/**
 * POST /api/counselors/:counselorId/available-slots
 * Add available slots for a counselor (protected)
 */
export const addAvailableSlots = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { counselorId } = req.params;
    const { slots } = req.body;

    // Verify the user is the counselor
    const counselor = await CounselorService.getCounselorById(counselorId);
    if (counselor.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only manage your own slots' });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: 'Slots must be a non-empty array' });
    }

    // Validate each slot
    const validatedSlots = slots.map((slot: any) => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw { status: 400, message: 'Invalid date format in slot' };
      }

      if (start >= end) {
        throw { status: 400, message: 'Slot start time must be before end time' };
      }

      return { start, end, isBooked: false };
    });

    const updated = await CounselorService.addAvailableSlots(counselorId, validatedSlots);

    return res.status(201).json({
      message: 'Slots added successfully',
      counselor: updated,
    });
  } catch (error: any) {
    console.error('Error adding slots:', error);

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.status === 403) {
      return res.status(403).json({ error: error.message });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to add slots' });
  }
};
