const express = require('express');
const { rangeController } = require('../../controllers/rangeController');

const router = express.Router();

// POST /api/v1/range/calc
router.post('/calc', rangeController.calculateRange);

module.exports = { rangeV1Router: router };


