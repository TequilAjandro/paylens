import { NextResponse } from "next/server";
import type { z } from "zod";

export function validationError(issues: z.ZodIssue[]) {
  return NextResponse.json(
    {
      detail: issues.map((issue) => ({
        loc: issue.path,
        msg: issue.message,
        type: issue.code,
      })),
    },
    { status: 422 },
  );
}
