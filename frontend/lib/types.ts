import { z } from "zod";
import * as schemas from "./schemas";

export type ManualProfile = z.infer<typeof schemas.ManualProfileSchema>;
export type GitHubProfileInput = z.infer<typeof schemas.GitHubProfileInputSchema>;
export type GitHubProfileOutput = z.infer<typeof schemas.GitHubProfileOutputSchema>;
export type DiagnosisResponse = z.infer<typeof schemas.DiagnosisResponseSchema>;
export type WhatIfRequest = z.infer<typeof schemas.WhatIfRequestSchema>;
export type WhatIfResponse = z.infer<typeof schemas.WhatIfResponseSchema>;
export type NegotiateRequest = z.infer<typeof schemas.NegotiateRequestSchema>;
export type NegotiateResponse = z.infer<typeof schemas.NegotiateResponseSchema>;
export type NegotiationReport = z.infer<typeof schemas.NegotiationReportSchema>;
