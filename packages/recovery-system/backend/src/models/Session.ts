import mongoose  from 'mongoose';

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,    
        ref: 'User',
        required: true
    },

    counselorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counselor',
        required: true
    },

    sessionDate: {
        type: Date,
        required: true
    },

    sessionTime : {
        type: Date,
        required: true
    },

    duration : {
        type: Number,
        default: 60
    },

    status : {
        type: String,
        enum : ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
        default : 'SCHEDULED'
    },

    sessionNotes : {
        type: String,
        default : ''
    },

    amount : {
        type: Number,
        required : true
    },

    ispaid : {
        type: Boolean,
        default : false
    },

    CancelSession : String,

    CancelledBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
},{ 
    timestamps: true
});

SessionSchema.index({userId: 1,status: 1});
SessionSchema.index({counselorId: 1,status: 1});
SessionSchema.index({sessionDate: 1});

export default mongoose.model('Session',SessionSchema);