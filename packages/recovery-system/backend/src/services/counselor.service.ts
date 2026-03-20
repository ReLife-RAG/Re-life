import Counselor, { ICounselor, IAvailableSlot } from '../models/Counselor';

export class CounselorService {
  /**
   * Get all counselors with optional filters
   */
  static async getAllCounselors(filters?: {
    specialty?: string;
    availability?: string;
    isVerified?: boolean;
  }) {
    const query: any = { isActive: true };

    if (filters?.specialty) {
      query.specializations = filters.specialty.toLowerCase();
    }

    if (filters?.isVerified !== undefined) {
      query.isVerified = filters.isVerified;
    }

    const counselors = await Counselor.find(query)
      .select('-credentials.license -availability')
      .populate('userId', 'name email');

    return counselors;
  }

  /**
   * Get a single counselor by ID
   */
  static async getCounselorById(counselorId: string) {
    if (!counselorId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid counselor ID format' };
    }

    const counselor = await Counselor.findById(counselorId)
      .select('-credentials.license')
      .populate('userId', 'name email');

    if (!counselor) {
      throw { status: 404, message: 'Counselor not found' };
    }

    return counselor;
  }

  /**
   * Get counselor by userId
   */
  static async getCounselorByUserId(userId: string) {
    const counselor = await Counselor.findOne({ userId });
    if (!counselor) {
      throw { status: 404, message: 'Counselor profile not found' };
    }
    return counselor;
  }

  /**
   * Check if a slot is available and not booked
   */
  static async isSlotAvailable(
    counselorId: string,
    slotStart: Date,
    slotEnd: Date
  ): Promise<boolean> {
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      throw { status: 404, message: 'Counselor not found' };
    }

    if (!counselor.availableSlots) {
      return false;
    }

    // Check if the exact slot exists and is not booked
    const slot = counselor.availableSlots.find(
      (s: IAvailableSlot) =>
        s.start.getTime() === slotStart.getTime() &&
        s.end.getTime() === slotEnd.getTime() &&
        !s.isBooked
    );

    return !!slot;
  }

  /**
   * Mark a slot as booked
   */
  static async markSlotAsBooked(
    counselorId: string,
    slotStart: Date,
    slotEnd: Date
  ): Promise<void> {
    try {
      const result = await Counselor.findByIdAndUpdate(
        counselorId,
        {
          $set: {
            'availableSlots.$[elem].isBooked': true,
          },
        },
        {
          arrayFilters: [
            {
              'elem.start': new Date(slotStart),
              'elem.end': new Date(slotEnd),
            },
          ],
        }
      );

      if (!result) {
        throw new Error('Slot not found or already booked');
      }
    } catch (error: any) {
      throw { status: 400, message: 'Failed to mark slot as booked: ' + error.message };
    }
  }

  /**
   * Mark a slot as available again
   */
  static async markSlotAsAvailable(
    counselorId: string,
    slotStart: Date,
    slotEnd: Date
  ): Promise<void> {
    try {
      // Use $elemMatch for more reliable date comparison
      const result = await Counselor.findByIdAndUpdate(
        counselorId,
        {
          $set: {
            'availableSlots.$[elem].isBooked': false,
          },
        },
        {
          arrayFilters: [
            {
              'elem.start': new Date(slotStart),
              'elem.end': new Date(slotEnd),
            },
          ],
        }
      );

      if (!result) {
        throw new Error('Slot not found');
      }
    } catch (error: any) {
      throw { status: 400, message: 'Failed to mark slot as available: ' + error.message };
    }
  }

  /**
   * Get counselor's available slots
   */
  static async getAvailableSlots(counselorId: string) {
    if (!counselorId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid counselor ID format' };
    }

    const counselor = await Counselor.findById(counselorId).select(
      'availableSlots -_id'
    );

    if (!counselor) {
      throw { status: 404, message: 'Counselor not found' };
    }

    return counselor.availableSlots?.filter((slot: IAvailableSlot) => !slot.isBooked) || [];
  }

  /**
   * Add available slots for a counselor
   */
  static async addAvailableSlots(
    counselorId: string,
    slots: IAvailableSlot[]
  ): Promise<ICounselor> {
    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      { $push: { availableSlots: { $each: slots } } },
      { new: true }
    );

    if (!counselor) {
      throw { status: 404, message: 'Counselor not found' };
    }

    return counselor;
  }
}
