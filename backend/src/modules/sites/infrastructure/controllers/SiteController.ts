import type { Request, Response } from 'express';
import { toActor } from '../../../../shared/utils/actor.js';
import { httpError } from '../../../../shared/utils/http.js';
import type { SiteUseCases } from '../../application/SiteUseCases.js';
import { loadCreateSiteData, loadUpdateSiteData } from '../validations/site-validation.js';

export class SiteController {
  constructor(private readonly useCases: SiteUseCases) {}

  list = async (req: Request, res: Response): Promise<Response> => {
    try {
      // admin puede filtrar por empresa, el trabajador ve la suya
      const company = typeof req.query.company === 'string' ? req.query.company : undefined;
      return res.json(await this.useCases.listSites.execute(toActor(req.user!), company));
    } catch (error) {
      return httpError(res, error);
    }
  };

  getOne = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.json(await this.useCases.getSite.execute(String(req.params.id), toActor(req.user!)));
    } catch (error) {
      return httpError(res, error);
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(201).json(await this.useCases.createSite.execute(toActor(req.user!), loadCreateSiteData(req.body)));
    } catch (error) {
      return httpError(res, error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.json(
        await this.useCases.updateSite.execute(String(req.params.id), toActor(req.user!), loadUpdateSiteData(req.body)),
      );
    } catch (error) {
      return httpError(res, error);
    }
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    try {
      // solo borra si el sitio no tiene reportes
      await this.useCases.deleteSite.execute(String(req.params.id), toActor(req.user!));
      return res.status(204).send();
    } catch (error) {
      return httpError(res, error);
    }
  };
}
