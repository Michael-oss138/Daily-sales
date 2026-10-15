
const { Router } = require('express');
const { z } = require('zod');

const Sale = require('../models/Sale');
const authenticate = require('../middleware/authenticate');
const requireBusinessAccess = require('../middleware/requireBusinessAccess');
const validate = require('../middleware/validate');

const router = Router();

const createSaleSchema = z.object({
  clientSaleId: z.string().uuid(),
  amountKobo: z.number().int().positive().safe(),
  description: z.string().trim().max(200).optional().default(''),
  paymentMethod: z.enum(['cash', 'transfer']),
  soldAt: z.string().datetime().optional(),
});

router.post(
  '/:businessId',
  authenticate,
  requireBusinessAccess,
  validate({ body: createSaleSchema }),
  async (req, res, next) => {
    try {
      const {
        clientSaleId,
        amountKobo,
        description,
        paymentMethod,
        soldAt,
      } = req.validated.body;

      const sale = await Sale.create({
        business: req.business.id,
        clientSaleId,
        amountKobo,
        description,
        paymentMethod,
        ...(soldAt ? { soldAt: new Date(soldAt) } : {}),
      });

      return res.status(201).json({
        message: 'Sale recorded successfully',
        sale: {
          id: sale._id,
          clientSaleId: sale.clientSaleId,
          amountKobo: sale.amountKobo,
          description: sale.description,
          paymentMethod: sale.paymentMethod,
          soldAt: sale.soldAt,
        },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          message: 'This sale has already been recorded',
        });
      }

      return next(err);
    }
  }
);

module.exports = router;
