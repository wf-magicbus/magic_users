import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1280px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
