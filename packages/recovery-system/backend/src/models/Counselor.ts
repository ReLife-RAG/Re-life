import mongoose, { Document, Schema } from 'mongoose';

export const ALLOWED_SPECIALIZATIONS = [
    'addiction',
    'substance_abuse',
    'alcohol_dependency',
    'drug_addiction',
    'behavioral_addiction',
    'social_media_addiction',
    'pornography_addiction',
    'trauma',
    'ptsd',
    'anxiety',
    'depression',
    'stress_management',
    'family_therapy',
    'group_therapy',
    'relapse_prevention',
    'dual_diagnosis',
    'teen_counseling',
    'adult_counseling',
    'elderly_care',
    'other',
] as const;

export type Specialization = (typeof ALLOWED_SPECIALIZATIONS)[number];

export interface ITimeSlot {
    start: string;
    end: string;
}

export interface IAvailableSlot {
    start: Date;
    end: Date;
    isBooked: boolean;
}

export interface ICredentials {
    degree: string;
    license: string;
    licenseState?: string;
    yearsOfExperience: number;
    certifications?: string[];
}

export interface IAvailability {
    daysAvailable: number[];
    timeSlots: ITimeSlot[];
}

export interface ICounselor extends Document {
    userId: mongoose.Types.ObjectId;
    credentials: ICredentials;
    specializations: Specialization[];
    bio: string;
    availability?: IAvailability;
    availableSlots?: IAvailableSlot[];
    rating?: number;
    ratingCount?: number;
    totalSessions: number;
    profileImage?: string;
    hourlyRate: number;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
    {
        start: { type: String, required: true },
        end: { type: String, required: true },
    },
    { _id: false }
);

const AvailableSlotSchema = new Schema<IAvailableSlot>(
    {
        start: { type: Date, required: true, index: true },
        end: { type: Date, required: true },
        isBooked: { type: Boolean, default: false },
    },
    { _id: false }
);

const CredentialsSchema = new Schema<ICredentials>(
    {
        degree: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 200,
        },
        license: {
            type: String,
            required: true,
            unique: true,
        },
        licenseState: {
            type: String,
        },
        yearsOfExperience: {
            type: Number,
            required: true,
            min: 0,
            max: 70,
        },
        certifications: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const CounselorSchema = new Schema<ICounselor>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
            unique: true,
        },
        credentials: {
            type: CredentialsSchema,
            required: true,
        },
        specializations: {
            type: [String],
            required: true,
            enum: ALLOWED_SPECIALIZATIONS,
            validate: {
                validator: (val: string[]) => val.length >= 1 && val.length <= 10,
                message: 'Specializations must have between 1 and 10 items',
            },
        },
        bio: {
            type: String,
            required: true,
            minlength: 50,
            maxlength: 2000,
        },
        availability: {
            daysAvailable: {
                type: [Number],
                default: [],
            },
            timeSlots: {
                type: [TimeSlotSchema],
                default: [],
            },
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        totalSessions: {
            type: Number,
            default: 0,
        },
        profileImage: {
            type: String,
        },
        hourlyRate: {
            type: Number,
            required: true,
            min: 0,
        },
        availableSlots: {
            type: [AvailableSlotSchema],
            default: [],
            index: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ICounselor>('Counselor', CounselorSchema);