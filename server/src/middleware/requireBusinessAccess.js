
const mongoose = require('mongoose');
const Membership = require('../models/Membership');
const AppError = require('../utils/AppError');

async function requireBusinessAccess(req, _res, next) {
  try {
    const { businessId } = req.params;

    if (!mongoose.isValidObjectId(businessId)) {
      throw AppError.notFound('Business not found');
    }

    const membership = await Membership.findOne({
      user: req.user.id,
      business: businessId,
    }).populate('business', 'name');

    if (!membership || !membership.business) {
      throw AppError.notFound('Business not found');
    }

    req.business = {
      id: membership.business._id.toString(),
      name: membership.business.name,
      role: membership.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireBusinessAccess;
