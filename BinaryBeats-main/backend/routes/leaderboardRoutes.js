// routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDailyLeaderboard, getWeeklyLeaderboard } = require('../controllers/leaderboardController');

router.get('/daily', getDailyLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

module.exports = router;