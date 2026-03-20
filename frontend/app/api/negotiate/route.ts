import { NextResponse } from "next/server";
import { buildNegotiationTurn } from "@/lib/mock-api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      company?: "mercadolibre" | "globant" | "nubank" | "rappi";
      role?: string;
      user_profile?: Record<string, unknown>;
      conversation_history?: Array<{ role: "user" | "assistant"; content: string }>;
      user_message?: string;
    };

    if (!payload.company || !payload.role || !payload.user_message) {
      return NextResponse.json({ detail: "Missing negotiate payload fields" }, { status: 400 });
    }

    return NextResponse.json(
      buildNegotiationTurn({
        company: payload.company,
        role: payload.role,
        user_profile: payload.user_profile || {},
        conversation_history: payload.conversation_history || [],
        user_message: payload.user_message,
      }),
    );
  } catch {
    return NextResponse.json({ detail: "Invalid negotiate payload" }, { status: 400 });
  }
}
