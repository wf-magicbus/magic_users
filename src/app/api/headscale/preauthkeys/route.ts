import { NextRequest, NextResponse } from "next/server";
import { headscaleFetch } from "@/lib/headscale";

export async function GET(req: NextRequest) {
  try {
    const user = req.nextUrl.searchParams.get("user") ?? "";
    const res = await headscaleFetch(`/preauthkey?user=${encodeURIComponent(user)}`);
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await headscaleFetch("/preauthkey", { method: "POST", body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/headscale/preauthkeys?action=expire
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await headscaleFetch("/preauthkey/expire", { method: "POST", body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
