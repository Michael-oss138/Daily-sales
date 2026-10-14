const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

const DB_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

// Liveness + DB readiness. Returns 503 when the database is not connected.
router.get('/', (_req, res) => {
  const state = mongoose.connection.readyState;
  const dbOk = state === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    database: DB_STATES[state] ?? 'unknown',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

module.exports = router;
