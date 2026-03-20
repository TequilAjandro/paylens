import { NextResponse } from "next/server";
import { validationError } from "@/lib/api-errors";
import { MockApiTemporaryError, buildNegotiationTurn, simulateMockApiBehavior } from "@/lib/mock-api";
import { NegotiateRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = NegotiateRequestSchema.strict().safeParse(payload);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    await simulateMockApiBehavior("negotiate");
    return NextResponse.json(buildNegotiationTurn(parsed.data));
  } catch (error) {
    if (error instanceof MockApiTemporaryError) {
      return NextResponse.json({ detail: "Mock API temporary failure" }, { status: 503 });
    }
    return NextResponse.json({ detail: "Invalid negotiate payload" }, { status: 400 });
  }
}
