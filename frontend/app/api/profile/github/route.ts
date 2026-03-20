import { NextResponse } from "next/server";
import { validationError } from "@/lib/api-errors";
import { GitHubProfileRequestSchema } from "@/lib/schemas";
import { MockApiTemporaryError, buildGitHubProfile, simulateMockApiBehavior } from "@/lib/mock-api";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = GitHubProfileRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    const usernameOrUrl = parsed.data.github_username || parsed.data.github_url || "developer";
    await simulateMockApiBehavior("profile/github");
    return NextResponse.json(buildGitHubProfile(usernameOrUrl));
  } catch (error) {
    if (error instanceof MockApiTemporaryError) {
      return NextResponse.json({ detail: "Mock API temporary failure" }, { status: 503 });
    }
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 });
  }
}
