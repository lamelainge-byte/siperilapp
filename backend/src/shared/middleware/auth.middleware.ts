import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
import { envs } from '../config/environment-vars.js';

export type AuthPayload = {
  sub: string;
  role: 'worker' | 'admin';
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// exige el jwt de acceso y deja id, rol y correo en la peticion
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  // el cliente manda authorization: bearer <access>
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token no proporcionado'));
  }
  try {
    req.user = jwt.verify(header.slice(7), envs.jwtAccessSecret) as AuthPayload;
    // slice(7) quita el prefijo bearer y verify rechaza firma o vencimiento
    next();
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}

// el admin pasa siempre y el trabajador solo si el rol coincide
export function requireRole(role: 'admin' | 'worker') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'No autenticado'));
    if (req.user.role !== role && req.user.role !== 'admin') {
      return next(new AppError(403, 'No tienes permisos para esta acción'));
    }
    next();
  };
}
