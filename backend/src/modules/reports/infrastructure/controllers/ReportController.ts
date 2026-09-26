import type { Request, Response } from 'express';
import { envs } from '../../../../shared/config/environment-vars.js';
import { toActor } from '../../../../shared/utils/actor.js';
import { httpError } from '../../../../shared/utils/http.js';
import { originFromRequest, withPublicImages } from '../../../../shared/utils/public-url.js';
import type { ReportUseCases } from '../../application/ReportUseCases.js';
import { loadCreateReportData, loadUpdateReportData } from '../validations/report-validation.js';

export class ReportController {
  constructor(private readonly useCases: ReportUseCases) {}

  private mediaOrigin(req: Request): string {
    return originFromRequest(req, envs.publicBaseUrl);
  }

  list = async (req: Request, res: Response): Promise<Response> => {
    try {
      // company solo lo usa el admin para acotar la consulta
      const company = typeof req.query.company === 'string' ? req.query.company : undefined;
      const reports = await this.useCases.listReports.execute(toActor(req.user!), company);
      return res.json(withPublicImages(reports, this.mediaOrigin(req)));
    } catch (error) {
      return httpError(res, error);
    }
  };

  stats = async (req: Request, res: Response): Promise<Response> => {
    try {
      // totales para el panel, protegido por rol admin en la ruta
      const company = typeof req.query.company === 'string' ? req.query.company : undefined;
      return res.json(await this.useCases.getReportStats.execute(company));
    } catch (error) {
      return httpError(res, error);
    }
  };

  getOne = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.json(
        withPublicImages(
          await this.useCases.getReport.execute(String(req.params.id), toActor(req.user!)),
          this.mediaOrigin(req),
        ),
      );
    } catch (error) {
      return httpError(res, error);
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      // la foto llega como multipart y se guarda la ruta relativa
      const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      return res.status(201).json(
        withPublicImages(
          await this.useCases.createReport.execute(toActor(req.user!), loadCreateReportData(req.body), imagePath),
          this.mediaOrigin(req),
        ),
      );
    } catch (error) {
      return httpError(res, error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      return res.json(
        withPublicImages(
          await this.useCases.updateReport.execute(
            String(req.params.id),
            toActor(req.user!),
            loadUpdateReportData(req.body),
            imagePath,
          ),
          this.mediaOrigin(req),
        ),
      );
    } catch (error) {
      return httpError(res, error);
    }
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.useCases.deleteReport.execute(String(req.params.id), toActor(req.user!));
      return res.status(204).send();
    } catch (error) {
      return httpError(res, error);
    }
  };

  resolve = async (req: Request, res: Response): Promise<Response> => {
    try {
      // pasa el reporte de pending a resolved
      return res.json(
        withPublicImages(
          await this.useCases.resolveReport.execute(String(req.params.id), toActor(req.user!)),
          this.mediaOrigin(req),
        ),
      );
    } catch (error) {
      return httpError(res, error);
    }
  };
}
