import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    return NextResponse.json({
      ...payload,
      profile_ready: true,
    });
  } catch {
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 });
  }
}
