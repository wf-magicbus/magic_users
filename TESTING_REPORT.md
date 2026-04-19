# MagicBus — Testing & Validation Report

Date: 2026-04-18

Purpose
- Provide the QA / engineering team a concise validation checklist and findings for the MagicBus admin console and API.

Scope
- Code inspected: authentication helpers, client auth guard, server API routes for users/sessions/roles/url-filter-rules, sidebar and policy components.
- Files reviewed (representative):
  - src/lib/use-auth-guard.ts
  - src/lib/supabase.ts
  - src/lib/supabase-admin.ts
  - src/app/api/users/route.ts
  - src/app/api/sessions/route.ts
  - src/app/api/url-filter-rules/route.ts
  - src/components/sidebar.tsx

Environment / Assumptions
- Next.js app (app router), client code uses `supabase` (anon key), server routes use `supabaseAdmin` (service role key).
- No automated test runner discovered; report is produced from static inspection and lightweight runtime verification steps described below.

High-level findings (summary)
- Authentication: `useAuthGuard` checks client session via `supabase.auth.getSession()` and a client-side `admin_session` localStorage entry. Redirects to `/login` when missing.
- Authorization: Authorization enforcement is primarily client-side via `admin_session` and local UI logic; many server API routes use `supabaseAdmin` but do not validate the caller's organization or privileges.
- Organization scoping: There is no clear enforcement in code that ties users to a specific organization or restricts access to organization-scoped resources (URLs, user lists, policies).
- Security risk: Using `supabaseAdmin` without server-side request-level authorization checks can expose data if the API endpoints are callable without verifying the requestor's organization membership/role.

Detailed test cases and validation steps

1) Authentication & Session
- Goal: Verify login, session persistence, redirect behavior.
- Steps:
  - Start the app with env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Sign in as a normal admin via the UI and confirm `supabase.auth.getSession()` returns a session and localStorage contains `admin_session`.
  - Clear localStorage; reload protected route (any path under app/) and verify redirect to `/login`.
- Expected:
  - When session exists and `admin_session` is valid, user stays; otherwise redirected to `/login`.

2) Authorization & Privileges
- Goal: Confirm role/privilege enforcement for admin actions.
- Steps:
  - Inspect `admin_session` payload (fields: `user_id`, `admin_id`, `role`, `privileges`) and test UI flows for different roles.
  - Call server APIs (see API section) while authenticated and unauthenticated.
- Expected:
  - UI hides or disables actions per `privileges`.
  - Server must reject unauthorized calls (see gaps below).

3) API Endpoints (representative)
- GET /api/users
  - Params: `search`, `status`, `page`, `limit`.
  - Test: query with/without params and confirm results and pagination metadata are correct.
  - Validate: SQL injection resilience via special characters in `search`.
- POST /api/users
  - Test: create user with minimal payload and with invalid `status`.
  - Expected: 201 on success; 400 on invalid status.
- GET/POST /api/url-filter-rules
  - Test: list rules filtered by `role` and `rule_type`; create new rule and ensure `super_admin` is rejected.

4) Organization scoping tests (missing enforcement)
- Goal: Ensure users only see resources for their organization.
- Steps to validate (manual or automated):
  - Create two organizations (OrgA, OrgB) and users belonging to each (if DB schema supports orgs).
  - With user from OrgA, call GET /api/users and ensure only OrgA users are returned.
  - Attempt to modify OrgB resources and expect 403/404.
- Current code status: no request-level org check detected. Add server-side checks.

5) UI & Component behavior
- Sidebar / navigation: test that links match available privileges and active state is correct.
- RoleSelector: test it fetches `/api/roles` and populates dropdown correctly.

Security & Data integrity checks
- Confirm that `supabaseAdmin` (service role) keys are only used on server code (they appear only in `src/lib/supabase-admin.ts` and server API routes). Do NOT expose service role to client bundles.
- Ensure API routes verify the caller's identity and organization membership before performing queries that return or modify sensitive data.

Observed gaps (actionable)
- Missing server-side authorization: many server endpoints call `supabaseAdmin` and query tables without validating the requestor's JWT or organization membership. This should be remedied by:
  1. Accepting a caller JWT (from `Authorization: Bearer <token>` or cookie) in each API route.
  2. Verifying the token server-side with `supabaseAdmin.auth.getUser()` or verifying the JWT and fetching the user's `org_id`/role.
  3. Applying `eq('org_id', userOrgId)` or appropriate filters to all queries that return multi-tenant data.
- Client-side guard reliance: the UI redirects to `/login` when `admin_session` is missing, but localStorage can be manipulated. Server-side checks cannot be bypassed by client changes — implement server checks.

Recommended fixes / priorities
1) High (must fix before wider rollout)
- Implement request-level auth verification in each API route that uses `supabaseAdmin`. Example pattern:
  - Read `Authorization` header or cookie.
  - Validate token with Supabase: `const { data: { user } } = await supabaseAdmin.auth.getUser(<access_token>)` (or use JWT verification).
  - Query the database scoping to `user.org_id` and check role/privileges.

2) Medium
- Store minimal `admin_session` in localStorage (avoid sensitive fields) and refresh from server on page load.
- Centralize server-side middleware to reduce duplication (a small helper like `requireAuth(req)` that returns the current user and org).

3) Low
- Add automated API tests (Jest + supertest) for endpoints and role matrix.

Appendix — Example API test steps (curl)
- Get users (with token):

```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" "http://localhost:3000/api/users?page=1&limit=20"
```

- Create url-filter-rule (reject super_admin):

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"value":"example.com","rule_type":"blocked_url","role":"admin"}' \
  http://localhost:3000/api/url-filter-rules
```

Next steps for QA / engineering
- Run the manual steps above in a staging environment and record pass/fail for each test case.
- Prioritize implementing server-side auth checks (High). I can create a server helper and patch API routes to demonstrate the pattern if you want.

Contact
- Report prepared by: GitHub Copilot (code-review & QA assistant)
- If you'd like, I can convert this file into a checklist-style report or create automated tests scaffolding.
