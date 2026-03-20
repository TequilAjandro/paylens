import { NextResponse } from "next/server";
import { validationError } from "@/lib/api-errors";
import { MockApiTemporaryError, buildWhatIf, simulateMockApiBehavior } from "@/lib/mock-api";
import { WhatIfRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = WhatIfRequestSchema.strict().safeParse(payload);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    await simulateMockApiBehavior("what-if");
    return NextResponse.json(buildWhatIf(parsed.data));
  } catch (error) {
    if (error instanceof MockApiTemporaryError) {
      return NextResponse.json({ detail: "Mock API temporary failure" }, { status: 503 });
    }
    return NextResponse.json({ detail: "Invalid what-if payload" }, { status: 400 });
  }
}
