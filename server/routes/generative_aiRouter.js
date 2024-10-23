var express = require('express');
var router = express.Router();

const { generativeAi } = require('../controllers/generative_aiController.js');

router.route('/generative_ai').post(generativeAi);

module.exports = router;
