const request = require('supertest');
const { z } = require('zod');
const express = require('express');
const { createApp } = require('../app');
const { loadEnv } = require('../config/env');
const validate = require('../middleware/validate');
const { notFound, errorHandler } = require('../middleware/errorHandler');
const AppError = require('../utils/AppError');

const validEnv = {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
  JWT_SECRET: 'x'.repeat(32),
};

describe('loadEnv', () => {
  test('applies defaults and parses CORS origins', () => {
    const c = loadEnv({ ...validEnv, CORS_ORIGINS: 'http://a.com, http://b.com' });
    expect(c.PORT).toBe(4000);
    expect(c.corsOrigins).toEqual(['http://a.com', 'http://b.com']);
  });

  test('fails fast with a readable message when required vars are missing', () => {
    expect(() => loadEnv({ NODE_ENV: 'test' })).toThrow(/MONGODB_URI/);
    expect(() => loadEnv({ ...validEnv, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });
});

describe('app', () => {
  const app = createApp(loadEnv(validEnv));

  test('health reports degraded (503) when DB is not connected', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: 'degraded', database: 'disconnected' });
  });

  test('unknown routes return a consistent 404 error shape', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('malformed JSON returns 400 INVALID_JSON', async () => {
    const res = await request(app)
      .post('/api/anything')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  test('sets security headers and hides x-powered-by', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('validate + errorHandler', () => {
  const app = express();
  app.use(express.json());
  app.post(
    '/t',
    validate({ body: z.object({ amount: z.number().int().positive() }) }),
    (req, res) => res.json(req.validated.body)
  );
  app.get('/boom', () => {
    throw new Error('secret internals');
  });
  app.get('/forbidden', () => {
    throw AppError.forbidden();
  });
  app.use(notFound);
  app.use(errorHandler);
  app.set('env', 'test');

  test('accepts valid input', async () => {
    const res = await request(app).post('/t').send({ amount: 250000 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ amount: 250000 });
  });

  test('rejects invalid input with details', async () => {
    const res = await request(app).post('/t').send({ amount: 25.5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0]).toMatchObject({ in: 'body', path: 'amount' });
  });

  test('unexpected errors return 500 without leaking internals', async () => {
    const res = await request(app).get('/boom');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/secret internals/);
  });

  test('AppError maps to its status and code', async () => {
    const res = await request(app).get('/forbidden');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
