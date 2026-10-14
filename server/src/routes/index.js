const { Router } = require('express');

const router = Router();

router.use('/health', require('./health.routes'));
// Phase 2: /auth, /businesses
// Phase 4: /businesses/:businessId/sales

module.exports = router;
