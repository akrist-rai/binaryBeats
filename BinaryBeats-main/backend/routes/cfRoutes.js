// routes/cfRoutes
const express = require('express');
const router = express.Router();
const { startCfVerification, confirmCfVerification } = require('../controllers/cfController');
const { verifyToken } = require('../middleware/auth');

router.post('/start-verification', verifyToken, startCfVerification);
router.post('/confirm-verification', verifyToken, confirmCfVerification);

module.exports = router;