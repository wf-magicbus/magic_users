---
name: No Supabase MCP in session
description: User prefers Supabase CLI over MCP tools for database operations
type: feedback
---

Never use Supabase MCP tools (mcp__claude_ai_Supabase__*) in any session. Always use the Supabase CLI (`supabase db` commands, `psql`, or `curl` to the management API) for any database queries or migrations.

**Why:** User explicitly rejected MCP tool use and prefers CLI-based Supabase access.

**How to apply:** When needing to inspect DB schema, run data queries, or apply migrations, use `curl` to the Supabase management API or `supabase` CLI commands instead.
