// models/user.js
const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    },
    displayName:{
        type: String,
        required: true,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email format'],
    },
    password: {
        type: String,
        required: true, // will store the bcrypt hash, never plain text
    },
    problemsSolved: {
        type: Number,
        default: 0,
        required: false,
    },
    rating: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },  
    codeforcesHandle: { 
        type: String, default: null 
    },
    cfVerified: { 
        type: Boolean, default: false 
    },
    cfVerificationCode: { 
        type: String, default: null 
    },
    cfVerificationExpires: { 
        type: Date, default: null 
    },
    leetcodeUsername: { type: String, default: null },
    leetcodeVerified: { type: Boolean, default: false },
    leetcodeVerificationCode: { type: String, default: null },
    leetcodeVerificationExpires: { type: Date, default: null },
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);