import { Capacitor } from '@capacitor/core';
import { DEV_LAN_ORIGIN } from './dev-host';

const API_PORT = 3000;

// el user agent del emulador no es el de un celular real
function isAndroidEmulator(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /sdk_gphone|Android SDK built for|generic_x86|Emulator/i.test(navigator.userAgent);
}

/** origen del api segun navegador, emulador o celular en la misma red */
export function apiOrigin(): string {
  if (!Capacitor.isNativePlatform()) {
    // en el navegador el api esta en el mismo pc
    return `http://localhost:${API_PORT}`;
  }
  if (isAndroidEmulator()) {
    // el emulador llega al pc por esta ip especial
    return `http://10.0.2.2:${API_PORT}`;
  }
  // celular fisico: ip de la red que dejo el script de desarrollo
  return DEV_LAN_ORIGIN.replace(/\/$/, '');
}

export function apiUrl(): string {
  return `${apiOrigin()}/api`;
}

// reescribe la foto al origen que usa este dispositivo
export function resolveMediaUrl(url: string | null | undefined, origin = apiOrigin()): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('capacitor:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${origin}${url}`;
  }
  try {
    const parsed = new URL(url);
    const target = new URL(origin);
    parsed.protocol = target.protocol;
    parsed.host = target.host;
    return parsed.toString();
  } catch {
    return url;
  }
}
