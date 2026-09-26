import 'reflect-metadata';
import { networkInterfaces } from 'node:os';
import { buildContainer } from './bootstrap/container.js';
import { AppDataSource } from './shared/config/data-source.js';
import { envs } from './shared/config/environment-vars.js';
import { App } from './web/App.js';

function lanAddresses(): string[] {
  const ips: string[] = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      const v4 = addr.family === 'IPv4';
      if (v4 && !addr.internal && !addr.address.startsWith('169.254.')) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

(async () => {
  try {
    // abre postgresql con typeorm antes de escuchar peticiones
    await AppDataSource.initialize();
    const server = new App(buildContainer()).getApp();
    server.listen(envs.port, '0.0.0.0', () => {
      // 0.0.0.0 deja entrar al emulador y al celular de la misma red
      console.log(`SIPERIL API en http://localhost:${envs.port}`);
      console.log(`Emulador Android: http://10.0.2.2:${envs.port}`);
      for (const ip of lanAddresses()) {
        console.log(`Celular (misma Wi‑Fi): http://${ip}:${envs.port}`);
      }
      console.log(`Swagger: http://localhost:${envs.port}/api/docs`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor', error);
    process.exit(1);
  }
})();
