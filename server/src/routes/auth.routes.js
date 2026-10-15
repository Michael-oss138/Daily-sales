
const { Router } = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Business = require('../models/Business');
const Membership = require('../models/Membership');
const AppError = require('../utils/AppError');
const validate = require('../middleware/validate');

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  businessName: z.string().trim().min(2).max(120),
});

router.post(
  '/register',
  validate({ body: registerSchema }),
  async (req, res, next) => {
    let user;

    try {
      const { name, email, password, businessName } = req.validated.body;
      const normalizedEmail = email.toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw AppError.conflict('An account with this email already exists');
      }

      const passwordHash = await bcrypt.hash(password, 12);

      user = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
      });

      const business = await Business.create({
        name: businessName,
        createdBy: user._id,
      });

      await Membership.create({
        user: user._id,
        business: business._id,
        role: 'owner',
      });

      const token = jwt.sign(
        { sub: user._id.toString() },
        req.app.locals.config.JWT_SECRET,
        { expiresIn: req.app.locals.config.JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        business: {
          id: business._id,
          name: business.name,
          role: 'owner',
        },
      });
    } catch (err) {
      // If setup fails after creating the user, remove incomplete records.
      if (user && user._id) {
        await Promise.all([
          Membership.deleteMany({ user: user._id }).catch(() => {}),
          Business.deleteMany({ createdBy: user._id }).catch(() => {}),
          User.deleteOne({ _id: user._id }).catch(() => {}),
        ]);
      }

      if (err.code === 11000) {
        return next(AppError.conflict('An account with this email already exists'));
      }

      return next(err);
    }
  }
);

module.exports = router;

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

router.post(
  '/login',
  validate({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.validated.body;

      const user = await User.findOne({
        email: email.toLowerCase(),
      }).select('+passwordHash');

      if (!user) {
        throw AppError.unauthorized('Invalid email or password');
      }

      const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!passwordMatches) {
        throw AppError.unauthorized('Invalid email or password');
      }

      const membership = await Membership.findOne({
        user: user._id,
        role: 'owner',
      }).populate('business', 'name');

      if (!membership || !membership.business) {
        throw AppError.unauthorized('No business access found for this account');
      }

      const token = jwt.sign(
        { sub: user._id.toString() },
        req.app.locals.config.JWT_SECRET,
        { expiresIn: req.app.locals.config.JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        business: {
          id: membership.business._id,
          name: membership.business.name,
          role: membership.role,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);
