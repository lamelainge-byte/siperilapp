import type { Request, Response } from 'express';
import { toActor } from '../../../../shared/utils/actor.js';
import { httpError } from '../../../../shared/utils/http.js';
import type { UserUseCases } from '../../application/UserUseCases.js';
import { loadUpdateUserData, loadUserData } from '../validations/user-validation.js';

export class UserController {
  constructor(private readonly useCases: UserUseCases) {}

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      // joi limpia el cuerpo y el caso de uso exige admin
      const user = await this.useCases.createUser.execute(toActor(req.user!), loadUserData(req.body));
      return res.status(201).json(user);
    } catch (error) {
      return httpError(res, error);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await this.useCases.updateUser.execute(
        String(req.params.id),
        toActor(req.user!),
        loadUpdateUserData(req.body),
      );
      return res.status(200).json(user);
    } catch (error) {
      return httpError(res, error);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(
        await this.useCases.getUser.execute(String(req.params.id), toActor(req.user!)),
      );
    } catch (error) {
      return httpError(res, error);
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      // el filtro de empresa llega por query string
      const company = typeof req.query.company === 'string' ? req.query.company : undefined;
      return res.status(200).json(await this.useCases.getUsers.execute(toActor(req.user!), company));
    } catch (error) {
      return httpError(res, error);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      // 204 sin cuerpo: la cuenta queda desactivada, no borrada
      await this.useCases.deleteUser.execute(String(req.params.id), toActor(req.user!));
      return res.status(204).send();
    } catch (error) {
      return httpError(res, error);
    }
  };
}
