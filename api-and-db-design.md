# User Management — REST API & Database Design

---


## REST API Endpoints

All endpoints are prefixed with `/rest/v1/rpc/` for functions or `/rest/v1/` for direct table access. Below uses logical grouping with the function-based approach (recommended for security).

---

### 1. PASSWORD POLICY

#### Get password policy for a role

```
GET /api/password-policy?role={role_name}
```

**Query params:** `role` — "all_users", "super_admin", "user_admin", "auditor"

**Response 200:**
```json
{
  "id": "uuid",
  "role": "super_admin",
  "min_password_length": 12,
  "require_uppercase": true,
  "require_lowercase": true,
  "require_digit": true,
  "require_special_char": true,
  "password_history_depth": 5,
  "max_password_age_days": 90,
  "min_password_age_days": 1,
  "store_reversible_encryption": false,
  "updated_at": "2026-02-28T14:00:00Z",
  "updated_by": "uuid"
}
```

#### Update password policy for a role

```
PUT /api/password-policy
```

**Request body:**
```json
{
  "role": "super_admin",
  "min_password_length": 14,
  "require_uppercase": true,
  "require_lowercase": true,
  "require_digit": true,
  "require_special_char": true,
  "password_history_depth": 5,
  "max_password_age_days": 60,
  "min_password_age_days": 1
}
```

**Response 200:** updated policy object (same shape as GET)

---

### 2. ACCOUNT LOCKOUT POLICY

#### Get lockout policy

```
GET /api/lockout-policy
```

**Response 200:**
```json
{
  "id": "uuid",
  "lockout_duration_minutes": 30,
  "lockout_threshold_attempts": 5,
  "reset_counter_after_minutes": 15,
  "updated_at": "2026-02-28T14:00:00Z",
  "updated_by": "uuid"
}
```

#### Update lockout policy

```
PUT /api/lockout-policy
```

**Request body:**
```json
{
  "lockout_duration_minutes": 30,
  "lockout_threshold_attempts": 5,
  "reset_counter_after_minutes": 15
}
```

**Response 200:** updated policy object

---

### 3. ADMIN ACCOUNTS

#### List all admin accounts

```
GET /api/admins
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Primary Admin",
    "email": "admin@company.com",
    "role": "super_admin",
    "privileges": ["manage_users", "reset_passwords", "unlock_accounts", "edit_policies", "manage_roles", "view_audit_log", "manage_groups", "billing_access"],
    "created_at": "2026-01-15T09:30:00Z",
    "created_by": "uuid"
  }
]
```

#### Create admin account

```
POST /api/admins
```

**Request body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@company.com",
  "role": "user_admin",
  "privileges": ["manage_users", "reset_passwords"]
}
```

**Response 201:** created admin object

#### Remove admin account

```
DELETE /api/admins/{admin_id}
```

**Response 204:** no content

#### Update admin privileges (grant/revoke on admin account)

```
PATCH /api/admins/{admin_id}/privileges
```

**Request body:**
```json
{
  "privileges": ["manage_users", "reset_passwords", "view_audit_log"]
}
```

**Response 200:** updated admin object

---

### 4. ADMIN ROLES

#### List roles

```
GET /api/admin-roles
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "role_name": "super_admin",
    "description": "Full system access",
    "is_dedicated_admin": true,
    "max_members": 3,
    "current_member_count": 1
  }
]
```

#### Update role settings

```
PATCH /api/admin-roles/{role_id}
```

**Request body:**
```json
{
  "is_dedicated_admin": true,
  "max_members": 5
}
```

**Response 200:** updated role object

---

### 5. PROTECTED GROUPS

#### List protected groups

```
GET /api/protected-groups
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "group_name": "super_admins",
    "description": "Highest privilege group",
    "member_count": 1
  }
]
```

---

### 6. USERS (Directory, Detail, Actions)

#### List users (directory)

```
GET /api/users?search={query}&status={status}&page={n}&limit={n}
```

**Query params:**
- `search` — filter by name or email (partial match)
- `status` — "active", "locked", "disabled", or omit for all
- `page` — page number (default 1)
- `limit` — results per page (default 25)

**Response 200:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Alice Chen",
      "email": "alice@company.com",
      "status": "active",
      "role": "super_admin",
      "last_login": "2026-02-28T14:32:00Z",
      "mfa_enabled": true
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}
```

#### Get user detail

```
GET /api/users/{user_id}
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Alice Chen",
  "email": "alice@company.com",
  "status": "active",
  "role": "super_admin",
  "last_login": "2026-02-28T14:32:00Z",
  "mfa_enabled": true,
  "password_last_changed": "2026-02-01",
  "password_expires_at": "2026-05-02",
  "must_change_password": false,
  "failed_attempts": 0,
  "is_locked": false,
  "privileges": ["manage_users", "reset_passwords", "unlock_accounts"]
}
```

#### Unlock user account

```
POST /api/users/{user_id}/unlock
```

**Request body:** none

**Response 200:**
```json
{
  "user_id": "uuid",
  "status": "active",
  "unlocked_at": "2026-02-28T15:00:00Z",
  "unlocked_by": "uuid"
}
```

#### Disable user account

```
POST /api/users/{user_id}/disable
```

**Request body:** none

**Response 200:**
```json
{
  "user_id": "uuid",
  "status": "disabled",
  "disabled_at": "2026-02-28T15:00:00Z",
  "disabled_by": "uuid"
}
```

#### Enable user account

```
POST /api/users/{user_id}/enable
```

**Request body:** none

**Response 200:**
```json
{
  "user_id": "uuid",
  "status": "active",
  "enabled_at": "2026-02-28T15:00:00Z",
  "enabled_by": "uuid"
}
```

#### Force password reset

```
POST /api/users/{user_id}/force-password-reset
```

**Request body:** none

**Response 200:**
```json
{
  "user_id": "uuid",
  "must_change_password": true,
  "forced_at": "2026-02-28T15:00:00Z",
  "forced_by": "uuid"
}
```

---

### 7. USER PRIVILEGES (Grant & Revoke)

#### Get user privileges

```
GET /api/users/{user_id}/privileges
```

**Response 200:**
```json
{
  "user_id": "uuid",
  "privileges": [
    {
      "key": "manage_users",
      "label": "Manage Users",
      "granted_at": "2026-01-15T09:30:00Z",
      "granted_by": "uuid"
    }
  ]
}
```

#### Grant privilege to user

```
POST /api/users/{user_id}/privileges/grant
```

**Request body:**
```json
{
  "privilege": "edit_policies"
}
```

**Response 200:**
```json
{
  "user_id": "uuid",
  "privilege": "edit_policies",
  "granted_at": "2026-02-28T15:00:00Z",
  "granted_by": "uuid"
}
```

#### Revoke privilege from user

```
POST /api/users/{user_id}/privileges/revoke
```

**Request body:**
```json
{
  "privilege": "edit_policies"
}
```

**Response 200:**
```json
{
  "user_id": "uuid",
  "privilege": "edit_policies",
  "revoked_at": "2026-02-28T15:00:00Z",
  "revoked_by": "uuid"
}
```

---

### 8. SESSIONS

#### List all active sessions (global)

```
GET /api/sessions?active=true
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "user_name": "Alice Chen",
    "user_email": "alice@company.com",
    "ip_address": "10.0.1.42",
    "device": "Chrome / macOS",
    "location": "San Francisco, US",
    "started_at": "2026-02-28T14:32:00Z",
    "is_active": true
  }
]
```

#### List sessions for a specific user

```
GET /api/users/{user_id}/sessions
```

**Response 200:** same shape as global, filtered to user

#### Terminate a session

```
DELETE /api/sessions/{session_id}
```

**Response 204:** no content

---

### 9. LOGIN HISTORY

#### Get login history for a user

```
GET /api/users/{user_id}/login-history?page={n}&limit={n}
```

**Response 200:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "timestamp": "2026-02-28T14:32:00Z",
      "success": true,
      "ip_address": "10.0.1.42",
      "device": "Chrome / macOS"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 25
}
```

---

### 10. ACCESS LOG (Grant/Revoke history)

#### List access log (global, all users)

```
GET /api/access-log?action={granted|revoked}&page={n}&limit={n}
```

**Query params:**
- `action` — "granted", "revoked", or omit for all
- `page`, `limit` — pagination

**Response 200:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "Alice Chen",
      "action": "granted",
      "item": "billing_access",
      "performed_by": "uuid",
      "performed_by_name": "admin01",
      "timestamp": "2026-02-20T10:00:00Z"
    }
  ],
  "total": 85,
  "page": 1,
  "limit": 25
}
```

#### Get access log for a specific user

```
GET /api/users/{user_id}/access-log
```

**Response 200:** same shape, filtered to user

---

## API Summary Table

| #  | Method   | Endpoint                                | Purpose                        |
|----|----------|-----------------------------------------|--------------------------------|
| 1  | `GET`    | `/api/password-policy?role=`            | Get password policy for role   |
| 2  | `PUT`    | `/api/password-policy`                  | Update password policy         |
| 3  | `GET`    | `/api/lockout-policy`                   | Get lockout policy             |
| 4  | `PUT`    | `/api/lockout-policy`                   | Update lockout policy          |
| 5  | `GET`    | `/api/admins`                           | List admin accounts            |
| 6  | `POST`   | `/api/admins`                           | Create admin account           |
| 7  | `DELETE` | `/api/admins/{id}`                      | Remove admin account           |
| 8  | `PATCH`  | `/api/admins/{id}/privileges`           | Update admin privileges        |
| 9  | `GET`    | `/api/admin-roles`                      | List roles                     |
| 10 | `PATCH`  | `/api/admin-roles/{id}`                 | Update role settings           |
| 11 | `GET`    | `/api/protected-groups`                 | List protected groups          |
| 12 | `GET`    | `/api/users`                            | List users (directory)         |
| 13 | `GET`    | `/api/users/{id}`                       | Get user detail                |
| 14 | `POST`   | `/api/users/{id}/unlock`                | Unlock account                 |
| 15 | `POST`   | `/api/users/{id}/disable`               | Disable account                |
| 16 | `POST`   | `/api/users/{id}/enable`                | Enable account                 |
| 17 | `POST`   | `/api/users/{id}/force-password-reset`  | Force password change          |
| 18 | `GET`    | `/api/users/{id}/privileges`            | Get user privileges            |
| 19 | `POST`   | `/api/users/{id}/privileges/grant`      | Grant privilege                |
| 20 | `POST`   | `/api/users/{id}/privileges/revoke`     | Revoke privilege               |
| 21 | `GET`    | `/api/sessions`                         | List all active sessions       |
| 22 | `GET`    | `/api/users/{id}/sessions`              | List user sessions             |
| 23 | `DELETE` | `/api/sessions/{id}`                    | Terminate session              |
| 24 | `GET`    | `/api/users/{id}/login-history`         | Get login history              |
| 25 | `GET`    | `/api/access-log`                       | Global access grant/revoke log |
| 26 | `GET`    | `/api/users/{id}/access-log`            | User access grant/revoke log   |

**Total: 26 endpoints**

---

## Database Design

All tables live under the `user_management` schema unless noted. Tables referencing `auth.users(id)` link to Supabase's built-in auth.

---

### Table 1: `password_policy`

Per-role password policy. One row per role (including "all_users" as default).

| Column                       | Type         | Nullable | Default  | Constraint / Notes                          |
|------------------------------|-------------|----------|----------|---------------------------------------------|
| `id`                         | UUID        | NO       | gen_random_uuid() | PK                                   |
| `role`                       | TEXT        | NO       | 'all_users' | UNIQUE — one policy per role             |
| `min_password_length`        | INT         | NO       | 12       | CHECK between 4 and 128                     |
| `require_uppercase`          | BOOLEAN     | NO       | TRUE     |                                             |
| `require_lowercase`          | BOOLEAN     | NO       | TRUE     |                                             |
| `require_digit`              | BOOLEAN     | NO       | TRUE     |                                             |
| `require_special_char`       | BOOLEAN     | NO       | TRUE     |                                             |
| `password_history_depth`     | INT         | NO       | 5        | CHECK between 0 and 50                      |
| `max_password_age_days`      | INT         | NO       | 90       | CHECK >= 0, 0 = never expires               |
| `min_password_age_days`      | INT         | NO       | 1        | CHECK >= 0                                  |
| `store_reversible_encryption`| BOOLEAN     | NO       | FALSE    | CHECK = FALSE (cannot enable)               |
| `updated_at`                 | TIMESTAMPTZ | NO       | now()    |                                             |
| `updated_by`                 | UUID        | YES      |          | FK → auth.users(id)                         |

**Indexes:** UNIQUE on `role`

---

### Table 2: `account_lockout_policy`

Singleton — one row enforced.

| Column                        | Type         | Nullable | Default | Constraint / Notes                     |
|-------------------------------|-------------|----------|---------|----------------------------------------|
| `id`                          | UUID        | NO       | gen_random_uuid() | PK                            |
| `lockout_duration_minutes`    | INT         | NO       | 30      | CHECK >= 0, 0 = admin-only unlock      |
| `lockout_threshold_attempts`  | INT         | NO       | 5       | CHECK between 1 and 100                |
| `reset_counter_after_minutes` | INT         | NO       | 15      | CHECK >= 1                             |
| `updated_at`                  | TIMESTAMPTZ | NO       | now()   |                                        |
| `updated_by`                  | UUID        | YES      |         | FK → auth.users(id)                    |

**Indexes:** UNIQUE on `((TRUE))` — singleton enforcement

---

### Table 3: `admin_roles`

Role definitions with membership controls.

| Column              | Type         | Nullable | Default | Constraint / Notes                              |
|---------------------|-------------|----------|---------|-------------------------------------------------|
| `id`                | UUID        | NO       | gen_random_uuid() | PK                                 |
| `role_name`         | TEXT        | NO       |         | UNIQUE                                          |
| `description`       | TEXT        | YES      |         |                                                 |
| `is_dedicated_admin`| BOOLEAN     | NO       | FALSE   | TRUE = requires separate admin-only account      |
| `max_members`       | INT         | NO       | 0       | CHECK >= 0, 0 = unlimited                       |
| `created_at`        | TIMESTAMPTZ | NO       | now()   |                                                 |
| `updated_at`        | TIMESTAMPTZ | NO       | now()   |                                                 |

---

### Table 4: `admin_accounts`

Individual admin users and their assigned role + privileges.

| Column        | Type         | Nullable | Default          | Constraint / Notes            |
|---------------|-------------|----------|------------------|-------------------------------|
| `id`          | UUID        | NO       | gen_random_uuid() | PK                           |
| `user_id`     | UUID        | NO       |                  | FK → auth.users(id), UNIQUE   |
| `name`        | TEXT        | NO       |                  |                               |
| `email`       | TEXT        | NO       |                  | UNIQUE                        |
| `role_id`     | UUID        | NO       |                  | FK → admin_roles(id)          |
| `created_at`  | TIMESTAMPTZ | NO       | now()            |                               |
| `created_by`  | UUID        | YES      |                  | FK → auth.users(id)           |

---

### Table 5: `admin_privileges`

Many-to-many: which privileges each admin holds.

| Column         | Type         | Nullable | Default          | Constraint / Notes                   |
|----------------|-------------|----------|------------------|--------------------------------------|
| `id`           | UUID        | NO       | gen_random_uuid() | PK                                  |
| `admin_id`     | UUID        | NO       |                  | FK → admin_accounts(id) ON DELETE CASCADE |
| `privilege_key`| TEXT        | NO       |                  | e.g. "manage_users", "billing_access"|
| `granted_at`   | TIMESTAMPTZ | NO       | now()            |                                      |
| `granted_by`   | UUID        | YES      |                  | FK → auth.users(id)                  |

**Indexes:** UNIQUE on `(admin_id, privilege_key)`

---

### Table 6: `protected_groups`

High-privilege group definitions.

| Column        | Type         | Nullable | Default          | Constraint / Notes |
|---------------|-------------|----------|------------------|--------------------|
| `id`          | UUID        | NO       | gen_random_uuid() | PK                |
| `group_name`  | TEXT        | NO       |                  | UNIQUE             |
| `description` | TEXT        | YES      |                  |                    |
| `created_at`  | TIMESTAMPTZ | NO       | now()            |                    |
| `updated_at`  | TIMESTAMPTZ | NO       | now()            |                    |

---

### Table 7: `user_profiles`

Extended user info beyond auth.users for the admin dashboard.

| Column                  | Type         | Nullable | Default          | Constraint / Notes                   |
|-------------------------|-------------|----------|------------------|--------------------------------------|
| `user_id`               | UUID        | NO       |                  | PK, FK → auth.users(id) ON DELETE CASCADE |
| `name`                  | TEXT        | NO       |                  |                                      |
| `status`                | TEXT        | NO       | 'active'         | CHECK in ('active','locked','disabled') |
| `role`                  | TEXT        | YES      |                  | current assigned role name            |
| `mfa_enabled`           | BOOLEAN     | NO       | FALSE            |                                      |
| `last_login`            | TIMESTAMPTZ | YES      |                  |                                      |
| `created_at`            | TIMESTAMPTZ | NO       | now()            |                                      |

---

### Table 8: `password_metadata`

Tracks password age, expiry, force-reset per user.

| Column                   | Type         | Nullable | Default | Constraint / Notes                        |
|--------------------------|-------------|----------|---------|-------------------------------------------|
| `user_id`                | UUID        | NO       |         | PK, FK → auth.users(id) ON DELETE CASCADE  |
| `password_last_changed`  | TIMESTAMPTZ | NO       | now()   |                                           |
| `password_expires_at`    | TIMESTAMPTZ | YES      |         | computed from policy max_age               |
| `must_change_password`   | BOOLEAN     | NO       | FALSE   |                                           |
| `change_count`           | INT         | NO       | 0       |                                           |

---

### Table 9: `password_history`

Hashed previous passwords for no-reuse enforcement.

| Column          | Type         | Nullable | Default          | Constraint / Notes                    |
|-----------------|-------------|----------|------------------|---------------------------------------|
| `id`            | UUID        | NO       | gen_random_uuid() | PK                                   |
| `user_id`       | UUID        | NO       |                  | FK → auth.users(id) ON DELETE CASCADE  |
| `password_hash` | TEXT        | NO       |                  | bcrypt/argon2 only, NEVER plaintext    |
| `sequence_num`  | INT         | NO       | 1                |                                       |
| `created_at`    | TIMESTAMPTZ | NO       | now()            |                                       |

**Indexes:** UNIQUE on `(user_id, sequence_num)`, INDEX on `(user_id, sequence_num DESC)`

---

### Table 10: `account_lockout_state`

Per-user runtime lockout tracking.

| Column                 | Type         | Nullable | Default | Constraint / Notes                        |
|------------------------|-------------|----------|---------|-------------------------------------------|
| `user_id`              | UUID        | NO       |         | PK, FK → auth.users(id) ON DELETE CASCADE  |
| `failed_attempt_count` | INT         | NO       | 0       |                                           |
| `first_failed_at`      | TIMESTAMPTZ | YES      |         |                                           |
| `last_failed_at`       | TIMESTAMPTZ | YES      |         |                                           |
| `is_locked`            | BOOLEAN     | NO       | FALSE   |                                           |
| `locked_at`            | TIMESTAMPTZ | YES      |         |                                           |
| `locked_until`         | TIMESTAMPTZ | YES      |         | NULL = admin-only unlock                   |
| `unlocked_by`          | UUID        | YES      |         | FK → auth.users(id)                        |
| `unlocked_at`          | TIMESTAMPTZ | YES      |         |                                           |

---

### Table 11: `user_privileges`

What privileges each regular user holds (separate from admin_privileges).

| Column          | Type         | Nullable | Default          | Constraint / Notes                        |
|-----------------|-------------|----------|------------------|-------------------------------------------|
| `id`            | UUID        | NO       | gen_random_uuid() | PK                                       |
| `user_id`       | UUID        | NO       |                  | FK → auth.users(id) ON DELETE CASCADE      |
| `privilege_key` | TEXT        | NO       |                  | e.g. "manage_users"                        |
| `granted_at`    | TIMESTAMPTZ | NO       | now()            |                                           |
| `granted_by`    | UUID        | YES      |                  | FK → auth.users(id)                        |

**Indexes:** UNIQUE on `(user_id, privilege_key)`

---

### Table 12: `user_sessions`

Active and historical sessions.

| Column       | Type         | Nullable | Default          | Constraint / Notes                        |
|--------------|-------------|----------|------------------|-------------------------------------------|
| `id`         | UUID        | NO       | gen_random_uuid() | PK                                       |
| `user_id`    | UUID        | NO       |                  | FK → auth.users(id) ON DELETE CASCADE      |
| `ip_address` | INET        | NO       |                  |                                           |
| `device`     | TEXT        | YES      |                  | user agent parsed: "Chrome / macOS"        |
| `location`   | TEXT        | YES      |                  | geo-IP resolved: "San Francisco, US"       |
| `started_at` | TIMESTAMPTZ | NO       | now()            |                                           |
| `ended_at`   | TIMESTAMPTZ | YES      |                  | NULL = still active                        |
| `is_active`  | BOOLEAN     | NO       | TRUE             |                                           |

**Indexes:** INDEX on `(user_id, is_active)`, INDEX on `(is_active) WHERE is_active = TRUE`

---

### Table 13: `login_history`

Every login attempt — success or fail.

| Column       | Type         | Nullable | Default          | Constraint / Notes                        |
|--------------|-------------|----------|------------------|-------------------------------------------|
| `id`         | UUID        | NO       | gen_random_uuid() | PK                                       |
| `user_id`    | UUID        | NO       |                  | FK → auth.users(id) ON DELETE CASCADE      |
| `success`    | BOOLEAN     | NO       |                  |                                           |
| `ip_address` | INET        | NO       |                  |                                           |
| `device`     | TEXT        | YES      |                  |                                           |
| `timestamp`  | TIMESTAMPTZ | NO       | now()            |                                           |

**Indexes:** INDEX on `(user_id, timestamp DESC)`

---

### Table 14: `access_log`

Every privilege grant and revoke — the audit trail.

| Column          | Type         | Nullable | Default          | Constraint / Notes                        |
|-----------------|-------------|----------|------------------|-------------------------------------------|
| `id`            | UUID        | NO       | gen_random_uuid() | PK                                       |
| `user_id`       | UUID        | NO       |                  | FK → auth.users(id) — target user          |
| `action`        | TEXT        | NO       |                  | CHECK in ('granted', 'revoked')            |
| `item`          | TEXT        | NO       |                  | what was granted/revoked                   |
| `performed_by`  | UUID        | YES      |                  | FK → auth.users(id) — who did it           |
| `timestamp`     | TIMESTAMPTZ | NO       | now()            |                                           |

**Indexes:** INDEX on `(timestamp DESC)`, INDEX on `(user_id, timestamp DESC)`, INDEX on `(action)`

---

### Table 15: `privileges_catalog`

Reference table — defines all available privileges.

| Column  | Type | Nullable | Default | Constraint / Notes |
|---------|------|----------|---------|--------------------|
| `key`   | TEXT | NO       |         | PK                 |
| `label` | TEXT | NO       |         |                    |
| `hint`  | TEXT | YES      |         |                    |

**Seed data:**

| key              | label                   | hint                                |
|------------------|-------------------------|-------------------------------------|
| manage_users     | Manage Users            | Create, edit, delete user accounts  |
| reset_passwords  | Reset Passwords         | Force password resets for users     |
| unlock_accounts  | Unlock Accounts         | Unlock locked-out accounts          |
| edit_policies    | Edit Policies           | Modify password & lockout policies  |
| manage_roles     | Manage Roles            | Assign and revoke admin roles       |
| view_audit_log   | View Audit Log          | Read-only access to audit trail     |
| manage_groups    | Manage Protected Groups | Add/remove protected group members  |
| billing_access   | Billing Access          | View and manage billing             |

---

## Database Summary

| #  | Table                   | Rows per | Purpose                                    |
|----|-------------------------|----------|--------------------------------------------|
| 1  | `password_policy`       | per role | Password rules per role                    |
| 2  | `account_lockout_policy`| 1 (singleton) | Lockout config                        |
| 3  | `admin_roles`           | few      | Role definitions + limits                  |
| 4  | `admin_accounts`        | few      | Admin user accounts                        |
| 5  | `admin_privileges`      | per admin| Privileges per admin account               |
| 6  | `protected_groups`      | few      | High-privilege group definitions           |
| 7  | `user_profiles`         | per user | Extended user info for dashboard           |
| 8  | `password_metadata`     | per user | Password age, expiry, force-reset          |
| 9  | `password_history`      | per user × depth | Hashed old passwords for no-reuse |
| 10 | `account_lockout_state` | per user | Failed attempts and lock status            |
| 11 | `user_privileges`       | per user | What privileges each user holds            |
| 12 | `user_sessions`         | per user × sessions | Active/historical sessions       |
| 13 | `login_history`         | per user × logins  | Every login attempt              |
| 14 | `access_log`            | grows    | Grant/revoke audit trail                   |
| 15 | `privileges_catalog`    | 8 (seed) | Reference: available privileges            |

**Total: 15 tables, 26 API endpoints**

---

## Endpoint → Table Mapping

| Endpoint                                | Tables Read                                          | Tables Written                          |
|-----------------------------------------|------------------------------------------------------|-----------------------------------------|
| GET password-policy                     | password_policy                                      | —                                       |
| PUT password-policy                     | password_policy                                      | password_policy, access_log             |
| GET lockout-policy                      | account_lockout_policy                               | —                                       |
| PUT lockout-policy                      | account_lockout_policy                               | account_lockout_policy, access_log      |
| GET admins                              | admin_accounts, admin_privileges                     | —                                       |
| POST admins                             | admin_accounts, admin_roles                          | admin_accounts, admin_privileges, access_log |
| DELETE admins/{id}                      | admin_accounts                                       | admin_accounts, admin_privileges, access_log |
| PATCH admins/{id}/privileges            | admin_accounts, admin_privileges                     | admin_privileges, access_log            |
| GET admin-roles                         | admin_roles, admin_accounts (count)                  | —                                       |
| PATCH admin-roles/{id}                  | admin_roles                                          | admin_roles, access_log                 |
| GET protected-groups                    | protected_groups                                     | —                                       |
| GET users                               | user_profiles                                        | —                                       |
| GET users/{id}                          | user_profiles, password_metadata, account_lockout_state, user_privileges | —              |
| POST users/{id}/unlock                  | account_lockout_state                                | account_lockout_state, user_profiles, access_log |
| POST users/{id}/disable                 | user_profiles                                        | user_profiles, user_sessions, access_log |
| POST users/{id}/enable                  | user_profiles                                        | user_profiles, access_log               |
| POST users/{id}/force-password-reset    | password_metadata                                    | password_metadata, access_log           |
| GET users/{id}/privileges               | user_privileges                                      | —                                       |
| POST users/{id}/privileges/grant        | user_privileges, privileges_catalog                  | user_privileges, access_log             |
| POST users/{id}/privileges/revoke       | user_privileges                                      | user_privileges, access_log             |
| GET sessions                            | user_sessions, user_profiles                         | —                                       |
| GET users/{id}/sessions                 | user_sessions                                        | —                                       |
| DELETE sessions/{id}                    | user_sessions                                        | user_sessions, access_log               |
| GET users/{id}/login-history            | login_history                                        | —                                       |
| GET access-log                          | access_log, user_profiles                            | —                                       |
| GET users/{id}/access-log               | access_log                                           | —                                       |
