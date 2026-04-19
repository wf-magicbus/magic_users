import { test, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { createMockServer } from './mockServer';

let BASE = process.env.API_BASE || 'http://localhost:3000';
let serverHandle;

beforeAll(async () => {
  const mock = createMockServer();
  serverHandle = await mock.start();
  BASE = serverHandle.url;
});

afterAll(async () => {
  if (serverHandle) await serverHandle.close();
});

test('GET /api/url-filter-rules returns an array', async () => {
  const res = await axios.get(`${BASE}/api/url-filter-rules`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.data)).toBe(true);
});

test('POST /api/url-filter-rules rejects super_admin role with 403', async () => {
  try {
    await axios.post(`${BASE}/api/url-filter-rules`, {
      value: 'example.com',
      rule_type: 'blocked_url',
      role: 'super_admin'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    throw new Error('Expected request to be rejected with 403');
  } catch (err) {
    if (err.response) {
      expect(err.response.status).toBe(403);
    } else {
      throw err;
    }
  }
});
