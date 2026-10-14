require('dotenv').config();
const { loadEnv } = require('./config/env');
const { connectDb, disconnectDb } = require('./config/db');
const { createApp } = require('./app');

async function main() {
  const config = loadEnv();
  await connectDb(config.MONGODB_URI);
  console.log('MongoDB connected');

  const app = createApp(config);
  const server = app.listen(config.PORT, () =>
    console.log(`API listening on http://localhost:${config.PORT} (${config.NODE_ENV})`)
  );

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
