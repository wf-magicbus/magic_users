# MagicBus — Comprehensive Test Cases

Purpose: Exhaustive, industry-style test case matrix for functional, security, authorization, multi-tenant scoping, API, UI and performance tests.

Instructions: Each test has an ID. Use `TEST_EXECUTION_REPORT.md` to record results, evidence links, and comments.

Legend:
- Priority: High / Medium / Low
- Auto: Manual / Automated / Hybrid
- Pre: Preconditions (data, env)
- Steps: Execution steps
- Expected: Expected result / acceptance criteria

AUTH-001 — Login: valid credentials
- Priority: High
- Auto: Hybrid
- Pre: Staging Supabase has test user `alice@orgA` with password `Test1234` and org_id OrgA
- Steps:
  1. Open `/login` UI.
 2. Enter credentials and submit.
 3. Observe redirect to dashboard.
- Expected: HTTP 200 login success, client receives session, `admin_session` saved, redirect to `/`.

AUTH-002 — Login: invalid credentials
- Priority: High
- Auto: Automated
- Pre: None
- Steps: Attempt login with wrong password
- Expected: Error message displayed, no session created, status 401.

AUTH-003 — Session expiry handling
- Priority: High
- Auto: Manual
- Pre: Active session
- Steps: Revoke session server-side (Supabase) or clear server token; refresh protected page
- Expected: Redirect to `/login` and no access to protected pages.

AUTH-004 — Sign out
- Priority: Medium
- Auto: Automated
- Steps: Click Sign Out in sidebar
- Expected: `supabase.auth.signOut()` called, `admin_session` removed, redirect to `/login`.

AUTH-005 — Local tampering: client-only elevation
- Priority: High
- Auto: Manual
- Steps: Modify `admin_session` role to `super_admin` in localStorage, attempt privileged action
- Expected: Server rejects unauthorized call (403). Client-only changes must not grant server privileges.

AUTH-006 — Token leak / service key check
- Priority: High
- Auto: Automated (build artifact scan)
- Steps: Build client bundle, scan for `SUPABASE_SERVICE_ROLE_KEY` or service-role strings
- Expected: Service role key does not appear in client bundles.

ORG-001 — Tenant isolation: list users
- Priority: High
- Auto: Automated
- Pre: Two orgs (OrgA, OrgB) with users
- Steps:
  1. Authenticate as OrgA user
  2. GET `/api/users`
- Expected: Returned users belong only to OrgA; no OrgB records.

ORG-002 — Tenant isolation: access by ID
- Priority: High
- Auto: Automated
- Steps: Attempt to GET/PUT/DELETE a resource that belongs to OrgB using OrgA credentials
- Expected: 403 or 404; no modifications allowed across orgs.

ORG-003 — Enforce org scoping in all server queries
- Priority: High
- Auto: Manual/Code review
- Steps: Inspect that each API route applies `eq('org_id', userOrgId)` or equivalent
- Expected: Code applies tenant-scoping before returning data.

API-001 — GET /api/users: query params & pagination
- Priority: Medium
- Auto: Automated
- Steps: Call `/api/users?search=Ali&status=active&page=1&limit=10`
- Expected: 200 OK, correct pagination fields, `ilike` search behavior, no errors on edge inputs.

API-002 — POST /api/users: validation
- Priority: Medium
- Auto: Automated
- Steps: POST with missing `name`, invalid `status`, duplicate name
- Expected: 400 for missing/invalid, 409 for duplicate, 201 for success.

API-003 — GET /api/url-filter-rules: filters
- Priority: Medium
- Auto: Automated
- Steps: GET with `role` and `rule_type` filters
- Expected: 200 and only rules matching filters returned.

API-004 — POST /api/url-filter-rules: reject `super_admin`
- Priority: Medium
- Auto: Automated
- Steps: POST rule with `role=super_admin`
- Expected: 403 with message `super_admin has no URL restrictions`.

API-005 — Input validation & injection resilience
- Priority: High
- Auto: Automated
- Steps: Submit large/randomized and SQL-like inputs in `search`, `value` fields
- Expected: No SQL injection; inputs are parameterized or escaped; server returns 400/422 on invalid payloads, not stack traces.

API-006 — Authenticated API calls require token
- Priority: High
- Auto: Automated
- Steps: Call write endpoints without `Authorization` header
- Expected: 401 Unauthorized (server enforces requireAuth).

UI-001 — Sidebar nav and active state
- Priority: Low
- Auto: Manual
- Steps: Navigate to multiple pages and confirm the active link state and labels
- Expected: Correct highlighting and accessible labels.

UI-002 — RoleSelector loads roles
- Priority: Medium
- Auto: Automated
- Steps: Render RoleSelector and confirm it fetches `/api/roles` and populates list
- Expected: Dropdown populated; handles empty state.

SEC-001 — OWASP Top 10: Authorization bypass
- Priority: High
- Auto: Manual + DAST
- Steps: Attempt bypass by manipulating requests and tokens
- Expected: No bypass possible; server returns appropriate 401/403.

PERF-001 — /api/users load test
- Priority: Medium
- Auto: Automated
- Steps: k6 script: 200 RPS sustained for 5 minutes
- Expected: p95 < 300ms, no 5xx errors.

CI-001 — Tests run in CI
- Priority: Medium
- Auto: Automated
- Steps: Add GitHub Actions to run unit/integration/e2e on PRs
- Expected: Tests run and block merges on failures.

Regression & traceability
- Each test case should reference ticket IDs for known issues and be tagged with owner and automation status in `TEST_EXECUTION_REPORT.md`.

End of Test Cases
