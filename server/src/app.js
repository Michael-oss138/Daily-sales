const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

/** Build the Express app. No side effects (no DB, no listen) so tests can import it. */
function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.set('env', config.NODE_ENV);
  app.locals.config = config;

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Allow non-browser clients (no Origin header) and whitelisted origins.
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
    })
  );
  if (config.NODE_ENV !== 'test') app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  // Sync batches may hold many sales; keep a sane cap.
  app.use(express.json({ limit: '256kb' }));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
