import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

// un error de negocio responde su codigo y cualquier otro responde 500
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor' });
}
