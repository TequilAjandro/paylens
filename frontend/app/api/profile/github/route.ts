import { NextResponse } from "next/server";
import { buildGitHubProfile } from "@/lib/mock-api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { github_url?: string; github_username?: string };
    const usernameOrUrl = payload.github_username || payload.github_url;

    if (!usernameOrUrl) {
      return NextResponse.json({ detail: "github_username is required" }, { status: 400 });
    }

    return NextResponse.json(buildGitHubProfile(usernameOrUrl));
  } catch {
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 });
  }
}
