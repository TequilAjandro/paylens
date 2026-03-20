import { NextResponse } from "next/server";
import { buildNegotiationReport } from "@/lib/mock-api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      final_offer?: number;
      initial_offer?: number;
    };

    if (typeof payload.final_offer !== "number" || typeof payload.initial_offer !== "number") {
      return NextResponse.json({ detail: "final_offer and initial_offer are required" }, { status: 400 });
    }

    return NextResponse.json(
      buildNegotiationReport({
        final_offer: payload.final_offer,
        initial_offer: payload.initial_offer,
      }),
    );
  } catch {
    return NextResponse.json({ detail: "Invalid negotiation report payload" }, { status: 400 });
  }
}
