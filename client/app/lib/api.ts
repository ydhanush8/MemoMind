'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

type ClerkGlobal = { session?: { getToken: () => Promise<string | null> } | null };

function clerk(): ClerkGlobal | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Clerk?: ClerkGlobal }).Clerk;
}

/**
 * Reads the Clerk session token, waiting briefly for Clerk to hydrate on first
 * paint (queries can fire before window.Clerk.session is ready). Returns null
 * for signed-out users after the short wait.
 */
async function getAuthToken(): Promise<string | null> {
  for (let i = 0; i < 20 && !clerk()?.session; i++) {
    await new Promise((r) => setTimeout(r, 50));
  }
  try {
    return (await clerk()?.session?.getToken()) ?? null;
  } catch {
    return null;
  }
}

/**
 * fetch wrapper for the standalone Express backend. Prefixes NEXT_PUBLIC_API_URL
 * and attaches the Clerk session token as a Bearer header (cookies don't cross
 * origins). Falls back to same-origin (relative) when NEXT_PUBLIC_API_URL is unset.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
