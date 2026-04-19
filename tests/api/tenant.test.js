import { test, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { createMockServer } from './mockServer';

let BASE;
let serverHandle;

beforeAll(async () => {
  const mock = createMockServer();
  serverHandle = await mock.start();
  BASE = serverHandle.url;
});

afterAll(async () => {
  if (serverHandle) await serverHandle.close();
});

test('ORG-001: tenant isolation - OrgA only sees OrgA users', async () => {
  const res = await axios.get(`${BASE}/api/users`, {
    headers: { Authorization: 'Bearer token-orgA-admin' },
  });
  expect(res.status).toBe(200);
  expect(Array.isArray(res.data.users)).toBe(true);
  expect(res.data.users.every((u) => u.org_id === 'OrgA')).toBe(true);
});

test('ORG-002: tenant isolation - cannot access other org user by ID', async () => {
  // token-orgA-admin should not be able to fetch user uB1 (OrgB)
  try {
    await axios.get(`${BASE}/api/users/uB1`, { headers: { Authorization: 'Bearer token-orgA-admin' } });
    throw new Error('Expected forbidden');
  } catch (err) {
    expect(err.response).toBeDefined();
    expect([403, 404]).toContain(err.response.status);
  }
});

test('API-006: authenticated write requires token', async () => {
  try {
    await axios.post(`${BASE}/api/users`, { name: 'Charlie' }, { headers: { 'Content-Type': 'application/json' } });
    throw new Error('Expected unauthorized');
  } catch (err) {
    expect(err.response).toBeDefined();
    expect(err.response.status).toBe(401);
  }
});

test('API-006: authenticated write with token creates user under caller org', async () => {
  const res = await axios.post(`${BASE}/api/users`, { name: 'Charlie' }, { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-orgB-admin' } });
  expect(res.status).toBe(201);
  expect(res.data.org_id).toBe('OrgB');
});
