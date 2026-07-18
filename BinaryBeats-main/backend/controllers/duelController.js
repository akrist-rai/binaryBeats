//controllers/duelController.js
const Duel = require('../models/duel');
const Problem = require('../models/problem');
const User = require('../models/user');

const MAX_RATING_GAP = 300;

async function pickProblemNearRating(targetRating) {
    const ranges = [0, 100, 200, 300];

    for (const spread of ranges) {
        const candidates = await Problem.find({
            difficultyRating: { $gte: targetRating - spread, $lte: targetRating + spread },
        });

        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }
    }
    return null;
}

// POST /duel/challenge   { opponentId }
exports.challengeUser = async (req, res) => {
    try {
        const { opponentId, mode = 'cp' } = req.body;
        const userId = req.user.userId;

        if (!opponentId) return res.status(400).json({ message: 'Opponent ID is required' });
        if (opponentId === userId) return res.status(400).json({ message: 'Cannot duel yourself' });

        const [player1, player2] = await Promise.all([
            User.findById(userId),
            User.findById(opponentId),
        ]);
        if (!player1 || !player2) return res.status(404).json({ message: 'One or both players not found' });

        const ratingGap = Math.abs(player1.rating - player2.rating);
        if (ratingGap > MAX_RATING_GAP) {
            return res.status(400).json({ message: `Rating gap too large (${ratingGap})` });
        }

        let duelData = {
            player1: player1._id,
            player2: player2._id,
            mode,
            status: 'pending',
        };

        if (mode === 'dsa') {
            const [easyOptions, mediumOptions, hardOptions] = await Promise.all([
                Problem.find({ mode: 'dsa', difficultyTier: 'easy' }),
                Problem.find({ mode: 'dsa', difficultyTier: 'medium' }),
                Problem.find({ mode: 'dsa', difficultyTier: 'hard' }),
            ]);

            if (!easyOptions.length || !mediumOptions.length || !hardOptions.length) {
                return res.status(500).json({ message: 'DSA problem pool is incomplete' });
            }

            const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

            duelData.problems = [
                pickRandom(easyOptions)._id,
                pickRandom(mediumOptions)._id,
                pickRandom(hardOptions)._id,
            ];
        }else {
            // CP mode — single problem picked by rating, difficultyTier stays null
            const avgRating = (player1.rating + player2.rating) / 2;
            const targetRating = Math.round(avgRating / 100) * 100;
            const problem = await pickProblemNearRating(targetRating);

            if (!problem) {
                return res.status(404).json({ message: 'No suitable problem found for this rating range' });
            }

            duelData.problem = problem._id;
        }

        const duel = await Duel.create(duelData);

        res.status(201).json({
            duel: {
                id: duel._id,
                mode: duel.mode,
                status: duel.status,
                opponent: { id: player2._id, username: player2.username, rating: player2.rating },
                problem: duel.problem,
                problems: duel.problems,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// GET /duel/pending
// returns duels where the logged-in user is the CHALLENGED player (player2)
// and the duel is still awaiting their response
exports.getPendingDuels = async (req, res) => {
    try {
        const userId = req.user.userId;

        const pendingDuels = await Duel.find({ player2: userId, status: 'pending' })
            .populate('player1', 'username rating')
            .populate('problem', 'title difficultyRating')
            .sort({ createdAt: -1 });

        res.status(200).json({ pendingDuels });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// POST /duel/:duelId/accept
exports.acceptDuel = async (req, res) => {
    try {
        const { duelId } = req.params;
        const userId = req.user.userId;

        const duel = await Duel.findById(duelId);
        if (!duel) {
            return res.status(404).json({ message: 'Duel not found' });
        }
        if (duel.status !== 'pending') {
            return res.status(400).json({ message: 'Duel is not pending' });
        }
        if (String(duel.player2) !== userId) {
            return res.status(403).json({ message: 'Only the challenged player can accept this duel' });
        }

        duel.status = 'in_progress';
        await duel.save();

        res.status(200).json({
            duel: { id: duel._id, status: duel.status, problem: duel.problem },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// POST /duel/:duelId/decline
exports.declineDuel = async (req, res) => {
    try {
        const { duelId } = req.params;
        const userId = req.user.userId;

        const duel = await Duel.findById(duelId);
        if (!duel) {
            return res.status(404).json({ message: 'Duel not found' });
        }
        if (duel.status !== 'pending') {
            return res.status(400).json({ message: 'Duel is not pending' });
        }
        if (String(duel.player2) !== userId) {
            return res.status(403).json({ message: 'Only the challenged player can decline this duel' });
        }

        duel.status = 'declined';
        await duel.save();

        res.status(200).json({ message: 'Duel declined' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// POST /duel/:duelId/finish   { winnerId }
// POST /duel/:duelId/finish   { winnerId }
exports.finishDuel = async (req, res) => {
    try {
        const { duelId } = req.params;
        const { winnerId } = req.body;

        const userId = req.user.userId;

        const duel = await Duel.findById(duelId);
        if (!duel) {
            return res.status(404).json({ message: 'Duel not found' });
        }
        if (duel.status !== 'in_progress') {
            return res.status(400).json({ message: 'Duel is not in progress' });
        }
        if (![String(duel.player1), String(duel.player2)].includes(userId)) {
            return res.status(403).json({ message: 'Not a participant in this duel' });
        }
        if (![String(duel.player1), String(duel.player2)].includes(winnerId)) {
            return res.status(400).json({ message: 'Winner must be one of the two duel participants' });
        }

        duel.status = 'completed';
        duel.winner = winnerId;
        await duel.save();

        res.status(200).json({
            duel: {
                id: duel._id,
                status: duel.status,
                winner: duel.winner,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};