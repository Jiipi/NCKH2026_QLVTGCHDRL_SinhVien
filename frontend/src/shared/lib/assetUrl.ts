import http from '../api/http';

/**
 * Get the API base URL from http instance or fallbacks
 */
const getApiBaseUrl = (): string => {
  // Always get fresh value from http instance
  const fromHttp = (http?.defaults?.baseURL || '').trim();
  if (fromHttp) return fromHttp.replace(/\/$/, '');

  // Fallback to window location
  if (typeof window !== 'undefined') {
    const protocol = window.location?.protocol || 'http:';
    const hostname = window.location?.hostname || 'localhost';
    const defaultPort = hostname === 'localhost' ? '3001' : window.location?.port || '';
    const portSegment = defaultPort ? `:${defaultPort}` : '';
    return `${protocol}//${hostname}${portSegment}/api`;
  }

  return (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
};

/**
 * Resolve asset URL to full absolute URL
 * @param url - Relative or absolute URL
 * @returns Full URL to asset
 */
export const resolveAssetUrl = (url: string = ''): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  // For /uploads paths, use relative path (proxied by CRA dev server)
  // This avoids cross-origin issues and works seamlessly in dev/prod
  if (url.startsWith('/uploads')) {
    return url;
  }

  const apiBase = getApiBaseUrl();
  const assetBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${assetBase}${normalizedPath}`;
};

export default resolveAssetUrl;
