import { NextRequest, NextResponse } from "next/server";
import { headscaleFetch } from "@/lib/headscale";

export async function GET() {
  try {
    const res = await headscaleFetch("/routes");
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/headscale/routes?id=<routeId>&action=enable|disable|delete
export async function POST(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const action = req.nextUrl.searchParams.get("action");
    if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });

    let res: Response;
    if (action === "enable") {
      res = await headscaleFetch(`/routes/${id}/enable`, { method: "POST" });
    } else if (action === "disable") {
      res = await headscaleFetch(`/routes/${id}/disable`, { method: "POST" });
    } else if (action === "delete") {
      res = await headscaleFetch(`/routes/${id}`, { method: "DELETE" });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
