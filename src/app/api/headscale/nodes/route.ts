import { NextResponse } from "next/server";
import { headscaleFetch } from "@/lib/headscale";

export async function GET() {
  try {
    const res = await headscaleFetch("/node");
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
