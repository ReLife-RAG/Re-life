import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  slotStart: Date;
  slotEnd: Date;
  fee: number;
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    counselorId: {
      type: Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
      index: true,
    },
    slotStart: {
      type: Date,
      required: true,
      index: true,
    },
    slotEnd: {
      type: Date,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Compound index for user and counselor bookings
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ counselorId: 1, slotStart: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
