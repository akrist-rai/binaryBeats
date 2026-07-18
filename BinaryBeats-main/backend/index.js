require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const cfRoutes = require('./routes/cfRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const problemRoutes = require('./routes/problemRoutes');
const duelRoutes = require('./routes/duelRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');

const { generalLimiter } = require('./middleware/rateLimiter');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(generalLimiter);

app.use('/auth', authRoutes);
app.use('/cf', cfRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/problems', problemRoutes);
app.use('/duel', duelRoutes);
app.use('/leetcode', leetcodeRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;