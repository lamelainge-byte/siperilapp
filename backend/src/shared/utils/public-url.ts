import type { Request } from 'express';

// arma el origen publico con el host de la peticion para que el celular abra las fotos
export function originFromRequest(req: Request, fallback: string): string {
  const host = req.get('host');
  if (!host) {
    return fallback.replace(/\/$/, '');
  }
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.protocol || 'http';
  return `${proto}://${host}`;
}

export function toAbsoluteAsset(pathOrUrl: string | null, origin: string): string | null {
  if (!pathOrUrl) {
    return null;
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const current = new URL(pathOrUrl);
      const target = new URL(origin);
      current.protocol = target.protocol;
      current.host = target.host;
      return current.toString();
    } catch {
      return pathOrUrl;
    }
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin.replace(/\/$/, '')}${path}`;
}

export function withPublicImages<T extends { imageUrl: string | null }>(data: T[], origin: string): T[];
export function withPublicImages<T extends { imageUrl: string | null }>(data: T, origin: string): T;
export function withPublicImages<T extends { imageUrl: string | null }>(
  data: T | T[],
  origin: string,
): T | T[] {
  const mapOne = (item: T): T => ({
    ...item,
    imageUrl: toAbsoluteAsset(item.imageUrl, origin),
  });
  return Array.isArray(data) ? data.map(mapOne) : mapOne(data);
}
