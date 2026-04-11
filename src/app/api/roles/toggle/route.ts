import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

// POST /api/roles/toggle — save or remove a policy config for a role
export async function POST(req: Request) {
  try {
    const { role, policy_table, enabled, values } = await req.json();
    if (!role || !policy_table) {
      return NextResponse.json({ error: "role and policy_table required" }, { status: 400 });
    }

    if (!enabled) {
      const { error } = await supabase.from(policy_table).delete().eq("role", role);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ role, policy_table, enabled: false });
    }

    // Check if row already exists
    const { data: existing } = await supabase
      .from(policy_table)
      .select("id")
      .eq("role", role)
      .maybeSingle();

    // Apply defaults for tables with required fields
    const DEFAULTS: Record<string, Record<string, unknown>> = {
      url_filter_rules: { rule_type: "blocked_url", value: "example.com", target_browser: "all", is_active: true },
      password_policy: { min_password_length: 8, max_password_age_days: 90, min_password_age_days: 1, password_history_depth: 5 },
      lockout_policy: { lockout_threshold_attempts: 5, lockout_duration_minutes: 30, observation_window_minutes: 30 },
      endpoint_protection: { defender_enabled: true, realtime_protection_enabled: true, cloud_protection_enabled: true, scan_removable_drives: true, automatic_sample_submission: false, scheduled_scan_type: "quick", scheduled_scan_day: "everyday" },
      firewall_policy: { profile: "domain", firewall_enabled: true, default_inbound_action: "block", default_outbound_action: "allow", log_dropped_packets: true, log_successful_connections: false, log_max_size_kb: 4096, allow_local_firewall_rules: false, allow_local_ipsec_rules: false, log_file_path: "%SystemRoot%\\System32\\LogFiles\\Firewall\\pfirewall.log" },
      hardening_policy: { local_admin_action: "rename", local_admin_new_name: "BuiltInAdmin", laps_enabled: true, laps_password_length: 20, laps_password_age_days: 30, laps_password_complexity: "large_small_numbers_specials", uac_enabled: true, uac_level: "always_notify", uac_admin_approval_mode: true, uac_detect_installations: true, powershell_logging_enabled: true, powershell_script_block_logging: true, powershell_module_logging: true, powershell_transcription_enabled: false, bitlocker_enabled: true, bitlocker_require_tpm: true, bitlocker_encryption_method: "xts_aes_256" },
      logon_restrictions: { admin_local_logon_only: true, local_logon_allowed_groups: ["Domain Admins", "Administrators"], rdp_admin_only: true, rdp_allowed_groups: ["Domain Admins", "Remote Desktop Users"], deny_service_account_local_logon: true, deny_local_logon_groups: ["Service Accounts"], deny_rdp_groups: ["Guests", "Service Accounts"] },
      removable_storage_policy: { deny_all_access: true, removable_disk_deny_read: true, removable_disk_deny_write: true, removable_disk_deny_execute: true, cd_dvd_deny_read: false, cd_dvd_deny_write: true, wpd_device_deny_read: false, wpd_device_deny_write: true, floppy_deny_read: true, floppy_deny_write: true, tape_deny_read: true, tape_deny_write: true },
    };

    const payload = { ...(DEFAULTS[policy_table] ?? {}), ...(values ?? {}), role };
    // Remove read-only fields
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    delete payload.gpo_object_id;

    let error;
    if (existing?.id) {
      ({ error } = await supabase.from(policy_table).update(payload).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from(policy_table).insert(payload));
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ role, policy_table, enabled: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
