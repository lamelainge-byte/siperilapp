import type { Request, Response } from 'express';
import path from 'path';
import { envs } from '../../../../shared/config/environment-vars.js';
import { toActor } from '../../../../shared/utils/actor.js';
import { httpError } from '../../../../shared/utils/http.js';
import { originFromRequest, withPublicImages } from '../../../../shared/utils/public-url.js';
import type { ReportUseCases } from '../../application/ReportUseCases.js';
import { imageFilename, type ReportImagePort } from '../../domain/ports/ReportImagePort.js';
import { loadCreateReportData, loadUpdateReportData } from '../validations/report-validation.js';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);

export class ReportController {
  constructor(
    private readonly useCases: ReportUseCases,
    private readonly images: ReportImagePort,
  ) {}

  private async storeUpload(file: Express.Multer.File | undefined): Promise<string | undefined> {
    if (!file?.buffer?.length) return undefined;
    const raw = path.extname(file.originalname).toLowerCase();
    const ext = IMAGE_EXT.has(raw) ? raw : '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const mime = file.mimetype.startsWith('image/') ? file.mimetype : 'image/jpeg';
    await this.images.save(filename, mime, file.buffer);
    return filename;
  }

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
    let filename: string | undefined;
    try {
      // la foto llega como multipart y se guarda en la base
      filename = await this.storeUpload(req.file);
      const imagePath = filename ? `/uploads/${filename}` : undefined;
      return res.status(201).json(
        withPublicImages(
          await this.useCases.createReport.execute(toActor(req.user!), loadCreateReportData(req.body), imagePath),
          this.mediaOrigin(req),
        ),
      );
    } catch (error) {
      if (filename) await this.images.remove(filename);
      return httpError(res, error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    let filename: string | undefined;
    try {
      const actor = toActor(req.user!);
      const previous = req.file
        ? await this.useCases.getReport.execute(String(req.params.id), actor)
        : null;
      filename = await this.storeUpload(req.file);
      const imagePath = filename ? `/uploads/${filename}` : undefined;
      const updated = await this.useCases.updateReport.execute(
        String(req.params.id),
        actor,
        loadUpdateReportData(req.body),
        imagePath,
      );
      const previousName = imageFilename(previous?.imageUrl);
      if (filename && previousName && previousName !== filename) {
        await this.images.remove(previousName);
      }
      return res.json(withPublicImages(updated, this.mediaOrigin(req)));
    } catch (error) {
      if (filename) await this.images.remove(filename);
      return httpError(res, error);
    }
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    try {
      const actor = toActor(req.user!);
      const current = await this.useCases.getReport.execute(String(req.params.id), actor);
      await this.useCases.deleteReport.execute(String(req.params.id), actor);
      const filename = imageFilename(current.imageUrl);
      if (filename) await this.images.remove(filename);
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
