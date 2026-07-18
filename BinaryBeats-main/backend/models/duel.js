// models/duel.js
const mongoose = require('mongoose');

const duelSchema = new mongoose.Schema(
    {
        player1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        player2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        mode: {
            type: String,
            enum: ['cp', 'dsa'],
            required: true,
        },
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            default: null, // used only for CP mode
        },
        problems: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
            default: [], // used only for DSA mode — holds all 3 (easy, medium, hard)
        },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'abandoned', 'declined'],
            default: 'pending',
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Duel', duelSchema);