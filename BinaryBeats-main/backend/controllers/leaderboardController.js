// controllers/leaderboardController.js
const Submission = require('../models/submission');

// GET /leaderboard/daily
exports.getDailyLeaderboard = async (req, res) => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const leaderboard = await Submission.aggregate([
            { $match: { status: 'accepted', createdAt: { $gte: oneDayAgo } } },

            // dedupe: one row per (user, problem) so re-submissions don't inflate count
            { $group: { _id: { userId: '$userId', problemId: '$problemId' }, solvedAt: { $min: '$createdAt' } } },

            // now count unique problems per user, and track their latest solve time
            {
                $group: {
                    _id: '$_id.userId',
                    solvedCount: { $sum: 1 },
                    lastSolvedAt: { $max: '$solvedAt' },
                },
            },

            // tie-break: more solves first, then earlier lastSolvedAt first
            { $sort: { solvedCount: -1, lastSolvedAt: 1 } },

            { $limit: 50 },

            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },

            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$user.username',
                    displayName: '$user.displayName',
                    rating: '$user.rating',
                    solvedCount: 1,
                    lastSolvedAt: 1,
                },
            },
        ]);

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// GET /leaderboard/weekly
exports.getWeeklyLeaderboard = async (req, res) => {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const leaderboard = await Submission.aggregate([
            { $match: { status: 'accepted', createdAt: { $gte: oneWeekAgo } } },
            { $group: { _id: '$userId', solvedCount: { $sum: 1 } } },
            { $sort: { solvedCount: -1 } },
            { $limit: 50 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$user.username',
                    displayName: '$user.displayName',
                    rating: '$user.rating',
                    solvedCount: 1,
                },
            },
        ]);

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};