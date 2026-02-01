import mongoose ,{Schema, Document} from 'mongoose';

export interface IAvailableSlot{
    dayOfWeek: String;
    startTime: String;
    endTime: String;
    isBooked: Boolean;
}

export interface Ireview{
    UserId : mongoose.Types.ObjectId;
    rating : number;
    comment : string;
    createdAt: Date;
}

export interface ICounselor extends Document{
    userId: mongoose.Types.ObjectId;
    specialization:String[];
    qualifaicaton:String[];
    bio:String;
    pricePersession:number;
    availableSlots:IAvailableSlot[];
    reviews:Ireview[];
    avergageRating:number;
    totalReviews:number;
    isActive:boolean;
    createdAt: Date;
    updatedAt: Date;
}

const availableSlotsSchema = new Schema<IAvailableSlot>({
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

    isBooked:{
        type:Boolean,
        default: false
    }
});

const reviewSchema = new Schema<Ireview>({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    rating:{
        type:Number,
        required: true,
        min:1,
        max: 5
    },
    comment :{
        type:String,
        maxLength: 500
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
});

const counselorScheme = new Schema <ICounselor>({
    userId :{
        type:Schema.Types.ObjectId,
        ref: 'User',
        required :true,
        unique: true
    },

    specialization : [{
        type : String,
        required :true
    }],

    qualifaicaton : [{
        type:String,
        required: true
    }],

    bio :{
        type :String,
        required : true,
        maxlength : 1000
    },

    pricePersession :{
        type : Number,
        required : true,
        min: 0
    },

    availableSlots : [availableSlotsSchema],
    reviews : [reviewSchema],
    avergageRating :{
        type : Number,
        default : 0,
        min : 0,
        max: 5
    },

    totalReviews : {
        type : Number,
        default : 0
    },

    isActive :{
        type:Boolean,
        default:true
    } 
},{
    timestamps :true
});

counselorScheme.index({userId: 1});
counselorScheme.index({specialization: 1});
counselorScheme.index({avergageRating: -1});

export default mongoose.model<ICounselor>('Counselor',counselorScheme)