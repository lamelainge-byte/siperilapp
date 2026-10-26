import type { Request, Response } from 'express';
import { httpError } from '../../../../shared/utils/http.js';
import type { AuthUseCases } from '../../application/AuthUseCases.js';
import { loadLoginData, loadRefreshData, loadRegisterData } from '../validations/auth-validation.js';

export class AuthController {
  constructor(private readonly useCases: AuthUseCases) {}

  // valida el cuerpo y crea la cuenta, responde 201
  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await this.useCases.registerUser.execute(loadRegisterData(req.body));
      return res.status(201).json({
        message: 'Cuenta creada. Ya puedes iniciar sesión.',
        user,
      });
    } catch (error) {
      return httpError(res, error);
    }
  };

  // devuelve access, refresh y el usuario si las credenciales cuadran
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.useCases.loginUser.execute(loadLoginData(req.body)));
    } catch (error) {
      return httpError(res, error);
    }
  };

  // cambia el refresh por una pareja nueva de tokens
  refresh = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.useCases.refreshSession.execute(loadRefreshData(req.body).refreshToken));
    } catch (error) {
      return httpError(res, error);
    }
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken =
        typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
      // el id sale del access token, no del cuerpo
      await this.useCases.logoutUser.execute(refreshToken, req.user!.sub);
      return res.status(200).json({ message: 'Sesión cerrada' });
    } catch (error) {
      return httpError(res, error);
    }
  };

  // perfil del usuario que viene en el token
  ingresos = async (req: Request, res: Response): Promise<Response> => {
    try {
      const logs = await this.useCases.listAccessLogs.execute({
        id: req.user!.sub,
        role: req.user!.role,
        email: req.user!.email,
      });
      return res.status(200).json(logs);
    } catch (error) {
      return httpError(res, error);
    }
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.useCases.getCurrentUser.execute(req.user!.sub));
    } catch (error) {
      return httpError(res, error);
    }
  };
}
