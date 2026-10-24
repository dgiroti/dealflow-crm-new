import type { z } from 'zod';
import {
  authResponseSchema,
  healthResponseSchema,
  type AuthResponse,
  type HealthResponse,
  type LoginInput,
  type RegisterInput,
} from '@dealflow/shared';

const API_BASE = '/api/v1';
// ── The one function every API call goes through ──

type RequestOptions = { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown };
// ── The access token: kept in memory only (never in localStorage) ──

let accessToken: string | null = null;
// If several requests need a refresh at the same moment, they all wait for ONE refresh call
let refreshInFlight: Promise<AuthResponse> | null = null;

// Code that wants to know when the session has ended (the AuthProvider)
const sessionExpiredListeners = new Set<() => void>();

export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

// Step 1: the actual request, which is exactly your version, with both fixes
async function requestNewTokens(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'same-origin', // send the httpOnly refresh cookie
  });
  if (!res.ok) throw await toApiError(res);

  const data = authResponseSchema.parse(await res.json());
  accessToken = data.accessToken;
  return data;
}

export function refreshSession(): Promise<AuthResponse> {
  if (!refreshInFlight) {
    refreshInFlight = requestNewTokens().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// // If several requests need a refresh at the same moment, they all wait for ONE refresh call
// let refreshInFlight: Promise<AuthResponse> | null = null;

// export function refreshSession(): Promise<AuthResponse> {
//   refreshInFlight ??= (async () => {
//     try {
//       const res = await fetch(`${API_BASE}/auth/refresh`, {
//         method: 'POST',
//         credentials: 'same-origin', // send the httpOnly refresh cookie
//       });
//       if (!res.ok) throw await toApiError(res);

//       const data = authResponseSchema.parse(await res.json());
//       accessToken = data.accessToken;
//       return data;
//     } finally {
//       refreshInFlight = null;
//     }
//   })();

//   return refreshInFlight;
// }

async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'same-origin',
  });

  // Access token expired? Refresh once and retry the same request.
  // (Never for /auth/ calls: a wrong password must not trigger a refresh.)
  if (res.status === 401 && !isRetry && !path.startsWith('/auth/')) {
    try {
      await refreshSession();
    } catch {
      accessToken = null;
      sessionExpiredListeners.forEach((listener) => listener());
      throw await toApiError(res);
    }
    return apiRequest(path, schema, options, true);
  }

  if (!res.ok) throw await toApiError(res);

  // Check the response matches the shared schema, so bad data never reaches a component
  return schema.parse(await res.json());
}

export type FieldError = { field: string; message: string };

// An error from the API, with its status and any per-field validation messages
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];

  constructor(status: number, message: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let body: { message?: string; errors?: FieldError[] } = {};
  try {
    body = await res.json();
  } catch {
    // The response wasn't JSON (for example, the API is down); keep the defaults
  }
  return new ApiError(res.status, body.message ?? `Request failed (${res.status})`, body.errors);
}

export async function login(loginInput: LoginInput): Promise<AuthResponse> {
  const data = await apiRequest('/auth/login', authResponseSchema, {
    method: 'POST',
    body: loginInput,
  });
  accessToken = data.accessToken;
  return data;
}

export async function register(registerInput: RegisterInput) {
  const data = await apiRequest('/auth/register', authResponseSchema, {
    method: 'POST',
    body: registerInput,
  });
  accessToken = data.accessToken;
  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });
  } finally {
    accessToken = null;
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  return healthResponseSchema.parse(await res.json());
}
