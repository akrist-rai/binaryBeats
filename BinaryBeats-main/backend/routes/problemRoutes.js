// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const { getProblems, getProblemBySlug } = require('../controllers/problemController');

router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);

module.exports = router;