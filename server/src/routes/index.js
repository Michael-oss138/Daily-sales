
const { Router } = require('express');

const router = Router();

router.use('/health', require('./health.routes'));
router.use('/auth', require('./auth.routes'));

module.exports = router;
