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

test('GET /api/users returns users list and pagination metadata', async () => {
  const res = await axios.get(`${BASE}/api/users`);
  expect(res.status).toBe(200);
  const body = res.data;
  expect(body).toHaveProperty('users');
  expect(Array.isArray(body.users)).toBe(true);
  expect(body).toHaveProperty('total');
  expect(body).toHaveProperty('page');
  expect(body).toHaveProperty('limit');
});
