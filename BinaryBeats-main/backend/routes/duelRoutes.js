// routes/duelRoutes.js
const express = require('express');
const router = express.Router();
const {
    challengeUser,
    getPendingDuels,
    acceptDuel,
    declineDuel,
    finishDuel,
} = require('../controllers/duelController');
const { verifyToken } = require('../middleware/auth');

router.post('/challenge', verifyToken, challengeUser);
router.get('/pending', verifyToken, getPendingDuels);
router.post('/:duelId/accept', verifyToken, acceptDuel);
router.post('/:duelId/decline', verifyToken, declineDuel);
router.post('/:duelId/finish', verifyToken, finishDuel);

module.exports = router;