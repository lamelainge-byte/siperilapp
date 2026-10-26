import 'reflect-metadata';
// typeorm lee los decoradores de las entidades (@entity, @column), sin esto, la conexion falla
import { networkInterfaces } from 'node:os';
import { buildContainer } from './bootstrap/container.js';
// arma casos de uso y adaptadores, todavia no abre la base: solo prepara las clases
import { AppDataSource } from './shared/config/data-source.js';
// objeto de conexion definido en data-source.ts (host, puerto, usuario, base)
import { envs } from './shared/config/environment-vars.js';
// lee y valida backend/.env, si falta la base o un secreto jwt, este import ya lanza error
import { App } from './web/App.js';
// express: middlewares y rutas /api

function lanAddresses(): string[] {
  // recorre las ips de la maquina para imprimir la url que usa un celular en la misma wi-fi
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

// funcion que se ejecuta sola al correr npm run dev
(async () => {
  try {
    // 1. abre postgresql, si el host, el puerto o la clave fallan, cae al catch
    await AppDataSource.initialize();
    // 2. con la base ya abierta, crea express y le pasa los casos de uso
    const server = new App(buildContainer()).getApp();
    // 3. escucha peticiones, 0.0.0.0 acepta localhost, el emulador y la red local
    server.listen(envs.port, '0.0.0.0', () => {
      console.log(`SIPERIL API en http://localhost:${envs.port}`);
      console.log(`Emulador Android: http://10.0.2.2:${envs.port}`);
      for (const ip of lanAddresses()) {
        console.log(`Celular (misma Wi‑Fi): http://${ip}:${envs.port}`);
      }
      console.log(`Swagger: http://localhost:${envs.port}/api/docs`);
    });
  } catch (error) {
    // cualquier fallo de conexion o de configuracion detiene el proceso
    console.error('No se pudo iniciar el servidor', error);
    process.exit(1);
  }
})();
