export async function sendInviteViaServer(payload) {
  try {
    const res = await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to send invite via server');
    }
    return await res.json();
  } catch (err) {
    console.warn('sendInviteViaServer failed:', err.message);
    throw err;
  }
}

export async function sendInvite(payload) {
  if (typeof window !== 'undefined' && window.base44 && window.base44.api && window.base44.api.sendInvite) {
    return window.base44.api.sendInvite(payload);
  }
  return sendInviteViaServer(payload);
}
