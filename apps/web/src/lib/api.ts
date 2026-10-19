import { healthResponseSchema, type HealthResponse } from '@dealflow/shared';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/v1/health');
  return healthResponseSchema.parse(await res.json());
}
