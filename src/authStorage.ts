const AUTH_TOKEN_SUFFIX = '-auth-token';
const LEGACY_UI_KEYS = [
  'currentScreen',
  'selectedGroupId',
  'edugestion_design_mode',
  'edugestion_last_version',
  'edugestion_remember_session',
];

// This browser-only client never keeps an auth token or school records persistently.
// Remove data written by older builds after explicit user authorization.
try {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key && (key.startsWith('edugestion_prod_') || (key.startsWith('sb-') && key.endsWith(AUTH_TOKEN_SUFFIX)))) {
      localStorage.removeItem(key);
    }
  }
  LEGACY_UI_KEYS.forEach((key) => localStorage.removeItem(key));
} catch {
  // Storage may be blocked by browser privacy settings.
}

export const authStorage = {
  async getItem(key: string) {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  async setItem(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch { /* Auth will surface storage errors. */ }
  },
  async removeItem(key: string) {
    try { sessionStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
    try { localStorage.removeItem(key); } catch { /* Clean up tokens from older app versions. */ }
  },
};
