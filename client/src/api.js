const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem('platepilot_session'));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (session) localStorage.setItem('platepilot_session', JSON.stringify(session));
  else localStorage.removeItem('platepilot_session');
}

export async function api(path, options = {}) {
  const session = getStoredSession();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'We could not complete that request.');
  return data;
}

