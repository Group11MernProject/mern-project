import request from 'supertest';
import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { app } from '../app.js';

const realFetch = global.fetch;

beforeAll(() => {
  global.fetch = jest.fn().mockRejectedValue(new Error('offline in tests'));
});

afterAll(() => {
  global.fetch = realFetch;
});

describe('PlatePilot JSON API', () => {
  test('reports service health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', service: 'platepilot-api' });
  });

  test('returns normalized fallback recipes when the third-party API is offline', async () => {
    const response = await request(app).get('/api/recipes?search=chicken');
    expect(response.status).toBe(200);
    expect(response.body.source).toBe('TheMealDB');
    expect(response.body.recipes.length).toBeGreaterThan(0);
    expect(response.body.recipes[0]).toEqual(expect.objectContaining({ id: expect.any(String), title: expect.any(String) }));
  });

  test('validates registration input before touching the database', async () => {
    const response = await request(app).post('/api/auth/register').send({ name: 'A', email: 'wrong', password: 'short' });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/valid email/i);
  });

  test('protects private meal plan routes', async () => {
    const response = await request(app).get('/api/meal-plans');
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication required/i);
  });

  test('serves an OpenAPI specification for API demos', async () => {
    const response = await request(app).get('/api/openapi.json');
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/recipes']).toBeDefined();
  });

  test('uses a consistent JSON response for unknown routes', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).toBe(404);
    expect(response.type).toMatch(/json/);
  });
});

