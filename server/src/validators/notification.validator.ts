export function validatePushSubscription(body: unknown): string | null {
  const b = (body ?? {}) as { endpoint?: string };
  if (!b.endpoint) return 'Invalid push subscription object';
  return null;
}
