# MagicBus — Test Execution Report (Template)

Project: MagicBus Admin Console
Date: 2026-04-20
Prepared by: Engineering / QA

Environment
- App running: staging / local
- Supabase: staging project (or mock server used)
- Notes: If using mock server, tests validate endpoint behavior but not actual DB enforcement.

How to run tests
1. Install dependencies:

```bash
npm install
```

2. Run API tests (mocked):

```bash
npm run test:api
```

3. To run tests against a running Next server (real endpoints):

```bash
API_BASE=http://localhost:3000 npm run test:api
```

Execution results
- Use this table to record results, evidence links (screenshots/logs), and comments.

| ID | Title | Priority | Auto | Status (Pass/Fail/Blocked) | Evidence link | Comments |
|----|-------|----------|------|----------------------------|---------------|----------|
| AUTH-001 | Login: valid credentials | High | Hybrid | | | |
| AUTH-002 | Login: invalid credentials | High | Automated | | | |
| AUTH-003 | Session expiry handling | High | Manual | | | |
| AUTH-004 | Sign out | Medium | Automated | | | |
| AUTH-005 | Local tampering: client-only elevation | High | Manual | | | |
| AUTH-006 | Token leak / service key check | High | Automated | | | |
| ORG-001 | Tenant isolation: list users | High | Automated | | | |
| ORG-002 | Tenant isolation: access by ID | High | Automated | | | |
| ORG-003 | Enforce org scoping in all server queries | High | Manual/Code review | | | |
| API-001 | GET /api/users: query params & pagination | Medium | Automated | | | |
| API-002 | POST /api/users: validation | Medium | Automated | | | |
| API-003 | GET /api/url-filter-rules: filters | Medium | Automated | | | |
| API-004 | POST /api/url-filter-rules: reject super_admin | Medium | Automated | | | |
| API-005 | Input validation & injection resilience | High | Automated | | | |
| API-006 | Authenticated API calls require token | High | Automated | | | |
| UI-001 | Sidebar nav and active state | Low | Manual | | | |
| UI-002 | RoleSelector loads roles | Medium | Automated | | | |
| SEC-001 | OWASP Top 10: Authorization bypass | High | Manual/DAST | | | |
| PERF-001 | /api/users load test | Medium | Automated | | | |
| CI-001 | Tests run in CI | Medium | Automated | | | |

Summary & Next Actions
- Blockers: (fill in if any tests are blocked by missing envs or feature flags)
- High-priority fixes required before production:
  1. Server-side tenant scoping middleware (`requireAuth` + org scoping).
  2. Server-side role/privilege checks on write endpoints.
  3. Ensure service-role keys are never exposed to client bundles.

Signoff
- QA lead: ____________  Date: _____
- Security lead: _______  Date: _____
- Product: ____________  Date: _____
