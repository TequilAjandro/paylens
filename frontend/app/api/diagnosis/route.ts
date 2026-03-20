import { NextResponse } from "next/server";
import { ManualProfileSchema } from "@/lib/schemas";
import { buildDiagnosis } from "@/lib/mock-api";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const profile = ManualProfileSchema.parse(payload);
    return NextResponse.json(buildDiagnosis(profile));
  } catch {
    return NextResponse.json({ detail: "Invalid diagnosis payload" }, { status: 400 });
  }
}
