// models/problem.js
const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
    {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false }, // hidden = used for judging, not shown to user
    },
    { _id: false }
);

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true, //sluggifying the problem titles for uniqueness
        },
        description: {
            type: String,
            required: true,
        },
        inputFormat: {
            type: String,
            default: '',
        },
        outputFormat: {
            type: String,
            default: '',
        },
        examples: {
            type: [testCaseSchema], // visible sample input/output shown to user
            default: [],
        },
        testCases: {
            type: [testCaseSchema], // full set used for judging (includes hidden ones)
            default: [],
        },
        timeLimit: {
            type: Number, // seconds
            default: 1,
        },
        memoryLimit: {
            type: Number, // MB
            default: 256,
        },
        difficultyRating: {
            type: Number,
            required: false,
            min: 800,
            max: 3500,
            index: true,
        },
        tags: {
            type: [String],
            default: [],
            index: true,
        },
        solvedCount: {
            type: Number,
            default: 0,
        },
        attemptCount: {
            type: Number,
            default: 0,
        },
        difficultyTier: {
            type: String,
            enum: ['easy', 'medium', 'hard', null],
            default: null, // null = CF-style problems, set only for DSA-mode problems
        },
        mode: {
            type: String,
            enum: ['cp', 'dsa'],
            default: 'cp',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Problem', problemSchema);