// routes/leetcodeRoutes.js
const express = require('express');
const router = express.Router();
const { startLeetcodeVerification, confirmLeetcodeVerification } = require('../controllers/leetcodeController');
const { verifyToken } = require('../middleware/auth');

router.post('/start-verification', verifyToken, startLeetcodeVerification);
router.post('/confirm-verification', verifyToken, confirmLeetcodeVerification);

module.exports = router;