
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },

    clientSaleId: {
      type: String,
      required: true,
      trim: true,
    },

    amountKobo: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: 'Sale amount must be a whole number of kobo',
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer'],
      required: true,
    },

    soldAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

saleSchema.index(
  { business: 1, clientSaleId: 1 },
  { unique: true }
);

saleSchema.index({ business: 1, soldAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);
