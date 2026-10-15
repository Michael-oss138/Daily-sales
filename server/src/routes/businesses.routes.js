
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const requireBusinessAccess = require('../middleware/requireBusinessAccess');

const router = Router();

router.get(
  '/:businessId',
  authenticate,
  requireBusinessAccess,
  (req, res) => {
    res.json({
      message: 'Business access granted',
      business: req.business,
    });
  }
);

module.exports = router;
