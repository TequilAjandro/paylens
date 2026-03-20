import { NextResponse } from "next/server";
import { validationError } from "@/lib/api-errors";
import { MockApiTemporaryError, buildNegotiationReport, simulateMockApiBehavior } from "@/lib/mock-api";
import { NegotiationReportRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = NegotiationReportRequestSchema.strict().safeParse(payload);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    await simulateMockApiBehavior("negotiate/report");
    return NextResponse.json(
      buildNegotiationReport({
        final_offer: parsed.data.final_offer,
        initial_offer: parsed.data.initial_offer,
      }),
    );
  } catch (error) {
    if (error instanceof MockApiTemporaryError) {
      return NextResponse.json({ detail: "Mock API temporary failure" }, { status: 503 });
    }
    return NextResponse.json({ detail: "Invalid negotiation report payload" }, { status: 400 });
  }
}
