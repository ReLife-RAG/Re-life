import mongoose, {Schema, Document} from 'mongoose';

export enum AppointmentStatus{
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface IAppointment extends Document{
    userId: mongoose.Types.ObjectId;
    counselorId :mongoose.Types.ObjectId;
    dayOfWeek: String;
    startTime: String;
    endTime: String;
    appointmentDate: Date;
    status: AppointmentStatus;
    notes?: String;
    counselorNotes?: String;
    meetingLink?: String;
    paymentAmount: number;
    paymentStatus: 'Pending' | 'Completed' | 'Failed';
    createdAt: Date;
    updatedAt: Date;
}

const AppoinmentSchema = new Schema<IAppointment>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true

    },
    counselorId:{
        type:Schema.Types.ObjectId,
        ref:'Counselor',
        required:true
    },
    dayOfWeek :{
        type: String,
        required: true,
        enum : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime:{
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime:{
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    appointmentDate:{
        type: Date,
        required:true
    },
    status:{
        type: String,
        enum: Object.values(AppointmentStatus),
        default: AppointmentStatus.PENDING
    },
    notes:{
        type: String,
        maxlength: 1000
    },
    counselorNotes:{
        type: String,
        maxlength: 1000
    },
    meetingLink:{
        type: String
    },
    paymentAmount:{
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus:{
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    }   
},{
    timestamps: true
});

AppoinmentSchema.index({userid: 1, appoinmentDate: 1, });
AppoinmentSchema.index({counselorId: 1, appoinmentDate: 1, });
AppoinmentSchema.index({status: 1});



