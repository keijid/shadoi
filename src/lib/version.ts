export const BUILD = __BUILD_INFO__;

/** e.g. "2026/09/07 15:32" — what the footer shows as the version. */
export function formatBuiltAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '不明';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Read the version of the build currently deployed. `no-store` matters: the
 * whole point is to see past the cached copy this page was loaded from.
 */
export async function fetchDeployedVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const v = (data as { version?: unknown } | null)?.version;
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Reload onto the new build. A plain reload can be served the cached HTML
 * (browsers ignore the old forced-reload flag), so navigate to a URL the
 * cache has never seen; the new HTML then pulls its own hashed assets.
 */
export function applyUpdate(version: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('v', version);
  window.location.replace(url.toString());
}

/** Drop the cache-busting parameter so it doesn't linger in the address bar. */
export function clearUpdateParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('v')) return;
  url.searchParams.delete('v');
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}
