/**
 * Update checker: compares the installed extension version against the latest
 * GitHub Release. Unpacked extensions cannot self-update, so this only NOTIFIES
 * the user (a banner) — they download the new release and reload manually.
 */

declare const chrome: any;

const REPO = 'huanbv/aether-wallet';

// Fallback used only when the extension manifest isn't available (e.g. the
// standalone web preview). Keep this in sync with public/manifest.json "version".
export const FALLBACK_VERSION = '1.0.1';

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string; // without a leading "v"
  releaseUrl: string;
}

export function getCurrentVersion(): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
      return chrome.runtime.getManifest().version || FALLBACK_VERSION;
    }
  } catch {
    /* not running as an extension */
  }
  return FALLBACK_VERSION;
}

function parseVersion(v: string): number[] {
  return (v || '')
    .toString()
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
}

/** Returns true when `remote` is a strictly newer semver than `current`. */
export function isNewer(remote: string, current: string): boolean {
  const r = parseVersion(remote);
  const c = parseVersion(current);
  const len = Math.max(r.length, c.length);
  for (let i = 0; i < len; i++) {
    const rv = r[i] || 0;
    const cv = c[i] || 0;
    if (rv > cv) return true;
    if (rv < cv) return false;
  }
  return false;
}

/**
 * Query the latest GitHub Release and report whether an update is available.
 * Returns null on any network/parse failure (caller simply shows no banner).
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const currentVersion = getCurrentVersion();
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const tag = (data?.tag_name || '').toString();
    if (!tag) return null;

    return {
      available: isNewer(tag, currentVersion),
      currentVersion,
      latestVersion: tag.replace(/^v/i, ''),
      releaseUrl: data?.html_url || `https://github.com/${REPO}/releases/latest`,
    };
  } catch {
    return null;
  }
}
