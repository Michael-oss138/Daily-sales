const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  // Comma-separated list of allowed browser origins.
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  // Used from Phase 2 (authentication). Validated now so misconfiguration fails fast.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

/** Parse and validate environment variables. Throws a readable error if invalid. */
function loadEnv(source = process.env) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  const env = result.data;
  return {
    ...env,
    isProduction: env.NODE_ENV === 'production',
    corsOrigins: env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  };
}

module.exports = { loadEnv };
