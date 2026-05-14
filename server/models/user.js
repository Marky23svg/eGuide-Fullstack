import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetCode: {
        type: String,
        default: null
    },
    resetCodeExpires: {
        type: Date,
        default: null
    },
    loginOtp: {
        type: String,
        default: null
    },
    loginOtpExpires: {
        type: Date,
        default: null
    }
});

const User = mongoose.model('User', userSchema);
export default User;