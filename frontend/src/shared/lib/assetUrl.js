import http from '../api/http';

const getApiBaseUrl = () => {
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

export const resolveAssetUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  const apiBase = getApiBaseUrl();
  const assetBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${assetBase}${normalizedPath}`;
};

export default resolveAssetUrl;

