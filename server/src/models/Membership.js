
const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'staff'],
      default: 'staff',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index(
  { user: 1, business: 1 },
  { unique: true }
);

module.exports = mongoose.model('Membership', membershipSchema);
