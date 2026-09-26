import { networkInterfaces } from 'node:os';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP_IFACE = /virtual|vethernet|docker|wsl|hyper-v|vmware|loopback|bluetooth|tun|tap|vethernet/i;
const PORT = process.env.SIPERIL_API_PORT || '3000';

function score(address) {
  if (address.startsWith('192.168.')) return 3;
  if (address.startsWith('10.')) return 2;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) return 1;
  return 0;
}

function lanIPv4() {
  if (process.env.SIPERIL_DEV_HOST) {
    return process.env.SIPERIL_DEV_HOST.replace(/^https?:\/\//, '').split(':')[0];
  }

  const found = [];
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    if (SKIP_IFACE.test(name)) continue;
    for (const addr of addrs ?? []) {
      const family = addr.family === 'IPv4' || addr.family === 4;
      if (!family || addr.internal || addr.address.startsWith('169.254.')) continue;
      found.push({ name, address: addr.address, score: score(addr.address) });
    }
  }
  found.sort((a, b) => b.score - a.score);
  return found[0]?.address ?? '10.0.2.2';
}

const ip = lanIPv4();
const origin = `http://${ip}:${PORT}`;
const dest = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'environments', 'dev-host.ts');

writeFileSync(
  dest,
  `/** Generado por scripts/write-dev-host.mjs — IP LAN del PC para el celular físico. */\nexport const DEV_LAN_ORIGIN = '${origin}';\n`,
  'utf8',
);

console.log(`SIPERIL API para celular: ${origin}`);
