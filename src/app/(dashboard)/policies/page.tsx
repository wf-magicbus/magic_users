"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import PasswordPolicyTab from "@/components/policy/tabs/PasswordPolicyTab";
import LockoutPolicyTab from "@/components/policy/tabs/LockoutPolicyTab";
import LogonRestrictionsTab from "@/components/policy/tabs/LogonRestrictionsTab";
import EndpointProtectionTab from "@/components/policy/tabs/EndpointProtectionTab";
import FirewallTab from "@/components/policy/tabs/FirewallTab";
import HardeningTab from "@/components/policy/tabs/HardeningTab";
import RemovableStorageTab from "@/components/policy/tabs/RemovableStorageTab";
import UrlFilteringTab from "@/components/policy/tabs/UrlFilteringTab";

const navSections = [
  {
    label: "Authentication",
    items: [
      {
        key: "password", label: "Password Policy", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" /></svg>
        )
      },
      {
        key: "lockout", label: "Account Lockout", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
        )
      },
      {
        key: "logon", label: "Logon Restrictions", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        )
      },
    ],
  },
  {
    label: "Device Security",
    items: [
      {
        key: "endpoint", label: "Endpoint Protection", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        )
      },
      {
        key: "firewall", label: "Firewall", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm2 7a1 1 0 100-2 1 1 0 000 2z" /></svg>
        )
      },
      {
        key: "hardening", label: "Hardening", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
        )
      },
      {
        key: "storage", label: "Removable Storage", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M8 5a1 1 0 000 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" /></svg>
        )
      },
    ],
  },
  {
    label: "Web",
    items: [
      {
        key: "url", label: "URL Filtering", icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" /></svg>
        )
      },
    ],
  },
] as const;

type PolicyKey = "password" | "lockout" | "logon" | "endpoint" | "firewall" | "hardening" | "storage" | "url";

const policyComponents: Record<PolicyKey, React.ComponentType> = {
  password: PasswordPolicyTab,
  lockout: LockoutPolicyTab,
  logon: LogonRestrictionsTab,
  endpoint: EndpointProtectionTab,
  firewall: FirewallTab,
  hardening: HardeningTab,
  storage: RemovableStorageTab,
  url: UrlFilteringTab,
};

const policyMeta: Record<PolicyKey, { title: string; description: string }> = {
  password: { title: "Password Policy", description: "Configure password complexity and age requirements per role" },
  lockout: { title: "Account Lockout", description: "Set thresholds for failed login attempts and lockout duration" },
  logon: { title: "Logon Restrictions", description: "Control who can log on locally, via RDP, and service account access" },
  endpoint: { title: "Endpoint Protection", description: "Microsoft Defender and real-time protection settings" },
  firewall: { title: "Windows Firewall", description: "Configure inbound/outbound rules for Domain, Private, and Public profiles" },
  hardening: { title: "System Hardening", description: "LAPS, UAC, BitLocker, PowerShell logging, and local admin management" },
  storage: { title: "Removable Storage", description: "Control USB, CD/DVD, mobile device, and portable storage access" },
  url: { title: "URL Filtering", description: "Manage blocked and allowed URLs and web categories per browser" },
};

export default function PoliciesPage() {
  const { loading } = useAuthGuard();
  const [active, setActive] = useState<PolicyKey>("password");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
    </div>
  );

  const ActiveComponent = policyComponents[active];
  const meta = policyMeta[active];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="page-header-icon">P</div>
            <h1 className="page-title">Policies</h1>
          </div>
          <p className="page-subtitle">Group Policy configuration and security settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Left Nav */}
          <div className="policy-nav">
            {navSections.map((section, si) => (
              <div key={section.label} className="policy-nav-section">
                <div className="policy-nav-section-title">
                  {section.label}
                </div>
                {section.items.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActive(item.key as PolicyKey)}
                      className={`policy-nav-item ${isActive ? "active" : ""}`}
                    >
                      <span className="policy-nav-item-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="policy-content">
            <div className="policy-content-header">
              <h2 className="policy-content-title">{meta.title}</h2>
              <p className="policy-content-description">{meta.description}</p>
            </div>
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
