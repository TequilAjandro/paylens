import { NextResponse } from "next/server";
import { buildWhatIf } from "@/lib/mock-api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      current_skills?: string[];
      hypothetical_add?: string[];
      hypothetical_remove?: string[];
      seniority?: string;
      location?: string;
    };

    return NextResponse.json(
      buildWhatIf({
        current_skills: payload.current_skills || [],
        hypothetical_add: payload.hypothetical_add || [],
        hypothetical_remove: payload.hypothetical_remove || [],
        seniority: payload.seniority || "mid",
        location: payload.location || "Mexico",
      }),
    );
  } catch {
    return NextResponse.json({ detail: "Invalid what-if payload" }, { status: 400 });
  }
}
