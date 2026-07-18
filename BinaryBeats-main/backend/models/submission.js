// models/submissions.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true, // e.g. "cpp", "python", "javascript"
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded'],
        default: 'pending',
    },
    runtime: {
        type: Number, // in ms, filled in once judged
    },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);