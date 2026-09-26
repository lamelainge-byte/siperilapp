import type { Response } from 'express';
import { AppError } from './errors.js';

// si el error es de negocio usa su codigo, si no responde 500
export function httpError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Error interno del servidor' });
}
