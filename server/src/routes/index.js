
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use('/health', require('./health.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/businesses', require('./businesses.routes'));


module.exports = router;
