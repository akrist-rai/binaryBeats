// controllers/problemController
const Problem = require('../models/problem');

// GET /problems?difficulty=1200&tag=dp&page=1&limit=20
exports.getProblems = async (req, res) => {
    try {
        const { difficulty, tag, mode = 'cp', page = 1, limit = 20 } = req.query;

        const filter = { mode };
        if (difficulty) filter.difficultyRating = Number(difficulty);
        if (tag) filter.tags = tag;

        const problems = await Problem.find(filter)
            .select('title slug difficultyRating difficultyTier mode tags solvedCount attemptCount')
            .sort({ difficultyRating: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Problem.countDocuments(filter);

        res.status(200).json({
            problems,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            totalProblems: total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// GET /problems/:slug
exports.getProblemBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const problem = await Problem.findOne({ slug }).select(
            'title slug description inputFormat outputFormat examples timeLimit memoryLimit difficultyRating tags solvedCount attemptCount'
        );

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json({ problem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};