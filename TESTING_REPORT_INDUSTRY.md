# MagicBus — Industry-Level Testing & Validation Report

Date: 2026-04-18

Prepared for: MagicBus QA / Security / Engineering Teams

Prepared by: Engineering Review (code inspection + test plan)

Executive summary
- Purpose: Provide an industry-standard testing report and acceptance criteria for the MagicBus admin console and backend APIs, focused on authentication, authorization, multi-tenant (organization) scoping, data protection, and reliability.
- Outcome: A prioritized test matrix, test cases (manual + automated), environment and data needs, security and performance test guidance, remediation recommendations, and sign-off criteria.

Scope
- Code and components inspected: client auth guard, `supabase` client, `supabaseAdmin` server client, representative API routes (users, sessions, roles, url-filter-rules), UI components (sidebar, role selector), and library helpers in `src/lib`.
- Included test domains:
  - Functional correctness (auth, APIs, UI flows)
  - Authorization / tenant isolation (organization scoping)
  - Security (secrets, data exposure, injection)
  - Reliability & performance (API latencies, concurrency)
  - Automation & CI integration

Test objectives
- Verify only authorized users can access protected routes and operations.
- Ensure all APIs enforce organization scoping and role-based access control server-side.
- Prove the system is resilient to malformed inputs, injection attempts, and replayed/misused tokens.
- Validate acceptable performance under expected load and define thresholds.

Test strategy
- Tiered approach:
  1. Static code review (already completed) to identify gaps.
  2. Manual exploratory testing in staging to validate flows and reproduce gaps.
  3. Automated API & integration tests (CI) for regression prevention.
  4. Security tests: SAST (own review), DAST (authenticated scans), and targeted pen-test activities.
  5. Load tests for critical API endpoints.

Test matrix (feature × test type)
- Authentication
  - Functional: login/logout/session expiry handling
  - Security: token leakage, session fixation
  - Automation: API and UI tests for login flows
- Authorization & Org Scoping
  - Functional: role-based UI gating
  - Security: server-side enforcement for org filters on all APIs
  - Automation: role/tenant matrix tests for all CRUD endpoints
- API Endpoints
  - Functional: parameter validation, pagination, error handling
  - Security: input validation (ILike, SQL-related), rate limiting checks
  - Performance: response time, throughput
- UI Components
  - Functional: navigation, RoleSelector, policy UIs
  - Accessibility: keyboard navigation, color contrast

Detailed test cases (representative)
1) Authentication & session lifecycle
- Preconditions: staging supabase instance, two test users (admin, regular), test orgs.
- Steps:
  - Successful login via UI; confirm access to protected pages.
  - Simulate session expiry: revoke session on server; reload page; expect redirect to `/login`.
  - Local tampering: modify `admin_session` in localStorage (change role to `super_admin`); attempt privileged actions — server should reject.
- Expected: client redirects when unauthenticated; server rejects elevated privileges from client-only changes.

2) Organization scoping (must-pass)
- Goal: Strict tenant isolation. Every multi-tenant query must be scoped to the authenticated user's `org_id`.
- Steps:
  - Create Org A and Org B with distinct data sets.
  - Authenticate as Org A user and call each API that returns lists (users, policies, url-filter-rules).
  - Confirm responses contain only Org A resources.
  - Attempt to access Org B resource by ID; expect 403 or 404.
- Required changes if failing:
  - Add server-side middleware/helper to extract and validate caller token, fetch `org_id`, and always apply `eq('org_id', userOrgId)` to queries.

3) API validation and robustness
- Test boundary and invalid inputs, e.g., long `search` strings, special characters, malformed JSON.
- Inject attempted SQL-like payloads and verify parameterization/escaping prevents injection.

4) Role & privilege enforcement
- Matrix test: For each role (super_admin, admin, viewer), enumerate allowed endpoints and actions and verify expected HTTP status codes for each action.

5) Security tests
- Secrets & config
  - Ensure `SUPABASE_SERVICE_ROLE_KEY` is never served to the client bundle; check build artifacts and server code only.
- Token validation
  - All server endpoints must accept a caller token and validate it server-side using `supabaseAdmin.auth.getUser()` or JWT verification.
- OWASP Top 10 checks
  - Authorization Bypass, Broken Access Control: test via crafted requests.
  - Injection: test `search` and other query parameters.

6) Performance and resiliency
- Load testing targets (example):
  - /api/users: 200 RPS sustained, 500 concurrent users (adjust to production expectations).
  - Acceptable p95 latency: < 300ms for read endpoints under expected load.
- Use k6 or Artillery for scripted scenarios (login, list users, fetch rules) with authenticated tokens.

Automation plan & CI integration
- Add test suites:
  - Unit tests for helper functions (Jest / Vitest).
  - Integration tests for API routes (supertest or Playwright for full-stack flows).
  - End-to-end tests for critical UI flows (Playwright).
- Place tests in `tests/` and run on PRs and main branch with GitHub Actions (example jobs: `unit`, `integration`, `e2e`, `security-scan`).

Acceptance criteria (must-pass)
- Functional: 100% of critical auth and org-scoping tests pass.
- Security: No high-severity findings from DAST or authenticated scans. No use of service-role keys in client bundles.
- Performance: Read endpoints meet p95 latency thresholds under expected load.

Risk assessment and mitigations
- Risk: Data leakage across tenants (High). Mitigation: Implement server-side org scoping middleware and mandatory token validation.
- Risk: Unauthorized admin actions via client tampering (High). Mitigation: Perform server-side checks for role/privilege on all modifying endpoints.

Remediation roadmap (prioritized)
1. Implement server-side auth helper `requireAuth(req)` that:
   - Extracts bearer token or session cookie
   - Validates token with Supabase / JWT
   - Returns user id and `org_id` and role
   - Is used at top of all API routes that use `supabaseAdmin`
2. Update all server APIs to apply `eq('org_id', user.org_id)` and check privileges before write operations.
3. Add CI tests validating tenant isolation and role matrix.

Appendix A — Example server-side auth pattern
```ts
// pseudo-code for API route
import { supabaseAdmin } from '@/lib/supabase-admin';

async function requireAuth(req: Request) {
  const auth = req.headers.get('authorization')?.split(' ')[1];
  if (!auth) throw new Error('Unauthorized');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(auth);
  if (error || !user) throw new Error('Invalid token');
  // fetch user profile to get org_id and role
  const { data: profile } = await supabaseAdmin.from('user_profiles').select('org_id, role').eq('user_id', user.id).single();
  return { user, profile };
}

// then in route handlers:
const { profile } = await requireAuth(request);
const query = supabaseAdmin.from('user_profiles').select('*').eq('org_id', profile.org_id);
```

Appendix B — Sample test commands (curl)
```bash
# list users (with token)
curl -H "Authorization: Bearer $ACCESS_TOKEN" "http://localhost:3000/api/users"

# create url-filter-rule
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"value":"example.com","rule_type":"blocked_url","role":"admin"}' http://localhost:3000/api/url-filter-rules
```

Appendix C — Suggested test artifacts to deliver
- `tests/integration/auth.test.ts` — token validation and session flows
- `tests/integration/tenant-isolation.test.ts` — tenant matrix tests
- `tests/e2e/login-and-actions.spec.ts` — Playwright scenario for UI
- `k6/` scripts for load tests

Sign-off template
- Security review: [name] — date — verdict
- QA acceptance: [name] — date — verdict
- Product acceptance: [name] — date — verdict

Next steps
- I can implement a `requireAuth` helper and patch representative API routes to demonstrate the enforcement pattern, and/or scaffold the automated tests described above. Which would you like me to do next?
