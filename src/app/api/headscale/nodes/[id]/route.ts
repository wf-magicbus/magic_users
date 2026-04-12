import { NextRequest, NextResponse } from "next/server";
import { headscaleFetch } from "@/lib/headscale";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/headscale/nodes/[id] — remove node
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const res = await headscaleFetch(`/node/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/headscale/nodes/[id]?action=expire|rename|tag
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const action = req.nextUrl.searchParams.get("action");
  try {
    let path = "";
    let body: any = undefined;
    if (action === "expire") {
      path = `/node/${id}/expire`;
    } else if (action === "rename") {
      const { name } = await req.json();
      path = `/node/${id}/rename/${name}`;
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    const res = await headscaleFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
