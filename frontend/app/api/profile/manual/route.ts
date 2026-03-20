import { NextResponse } from "next/server";
import { validationError } from "@/lib/api-errors";
import { MockApiTemporaryError, simulateMockApiBehavior } from "@/lib/mock-api";
import { ManualProfileSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = ManualProfileSchema.strict().safeParse(payload);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    await simulateMockApiBehavior("profile/manual");
    return NextResponse.json({
      ...parsed.data,
      profile_ready: true,
    });
  } catch (error) {
    if (error instanceof MockApiTemporaryError) {
      return NextResponse.json({ detail: "Mock API temporary failure" }, { status: 503 });
    }
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 });
  }
}
