import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { resolveMediaUrl } from '../../../environments/api';
import { environment } from '../../../environments/environment';
import type { Report, ReportType } from '../../models/siperil.models';
import { SqliteService } from './sqlite.service';

export interface ReportPayload {
  reportType: ReportType;
  description: string;
  incidentDate?: string | null;
  incidentTime?: string | null;
  shift?: string | null;
  place?: string | null;
  office?: string | null;
  equipmentType?: string | null;
  damageKind?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image?: Blob | null;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(
    private http: HttpClient,
    private sqlite: SqliteService,
  ) {}

  isOnline(): boolean {
    return navigator.onLine;
  }

  async list(company?: string): Promise<Report[]> {
    // trae reportes del api y deja una copia en sqlite
    const params = company ? { company } : undefined;
    const reports = (await firstValueFrom(
      this.http.get<Report[]>(`${environment.apiUrl}/reports`, { params }),
    )).map((report) => this.mapReport(report));
    void this.sqlite.saveReports(reports).catch(() => undefined);
    return reports;
  }

  async get(id: string): Promise<Report> {
    return this.mapReport(
      await firstValueFrom(this.http.get<Report>(`${environment.apiUrl}/reports/${id}`)),
    );
  }

  stats(): Promise<{ total: number; pending: number; resolved: number; companies: string[] }> {
    return firstValueFrom(
      this.http.get<{ total: number; pending: number; resolved: number; companies: string[] }>(
        `${environment.apiUrl}/reports/stats`,
      ),
    );
  }

  async create(payload: ReportPayload): Promise<Report> {
    // sin red el alta queda en la cola local y se sube despues
    if (!this.isOnline()) {
      return this.queueCreate(payload);
    }
    try {
      const report = this.mapReport(
        await firstValueFrom(
          this.http.post<Report>(`${environment.apiUrl}/reports`, this.toForm(payload)),
        ),
      );
      await this.sqlite.upsertReport(report);
      return report;
    } catch (err) {
      // status 0 es corte de red, entonces se encola igual que sin conexion
      if (this.isNetworkError(err)) {
        return this.queueCreate(payload);
      }
      throw err;
    }
  }

  async update(id: string, payload: Partial<ReportPayload>): Promise<Report> {
    // la edicion va directo al api, no usa la cola offline
    const report = this.mapReport(
      await firstValueFrom(
        this.http.put<Report>(`${environment.apiUrl}/reports/${id}`, this.toForm(payload)),
      ),
    );
    await this.sqlite.upsertReport(report);
    return report;
  }

  remove(id: string): Promise<void> {
    // el borrado lo confirma la pantalla antes de llamar aqui
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/reports/${id}`));
  }

  async resolve(id: string): Promise<Report> {
    // solo el admin llama este patch desde el detalle o el panel
    return this.mapReport(
      await firstValueFrom(
        this.http.patch<Report>(`${environment.apiUrl}/reports/${id}/resolve`, {}),
      ),
    );
  }

  // sube al api lo que quedo en la cola sqlite cuando vuelve la conexion
  async flushQueue(): Promise<void> {
    if (!this.isOnline()) {
      return;
    }
    const jobs = await this.sqlite.pendingJobs();
    for (const job of jobs) {
      try {
        const data = job.body ? JSON.parse(job.body) : {};
        const form = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            form.append(key, String(value));
          }
        });
        await firstValueFrom(
          this.http.request(job.method, `${environment.apiUrl}${job.path}`, {
            body: job.method === 'DELETE' ? undefined : form,
          }),
        );
        await this.sqlite.removeJob(job.id);
      } catch (err) {
        // si un envio falla se marca el trabajo y se sigue con el siguiente
        await this.sqlite.failJob(job.id, err instanceof Error ? err.message : 'Error de sync');
      }
    }
  }

  private async queueCreate(payload: ReportPayload): Promise<Report> {
    // id local hasta que el api confirme el reporte real
    const localId = `local-${crypto.randomUUID()}`;
    const report: Report = {
      id: localId,
      reportType: payload.reportType,
      userId: 'local',
      company: '',
      description: payload.description,
      incidentDate: payload.incidentDate ?? null,
      incidentTime: payload.incidentTime ?? null,
      shift: payload.shift ?? null,
      place: payload.place ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      weatherSummary: null,
      imageUrl: null,
      status: 'pending',
      resolvedAt: null,
      resolvedById: null,
      createdAt: new Date().toISOString(),
    };
    await this.sqlite.upsertReport(report);
    await this.sqlite.saveDraft(localId, payload.reportType, payload);
    // la foto no entra a la cola porque el archivo no se puede guardar como texto
    const { image: _image, ...jsonBody } = payload;
    await this.sqlite.enqueue({
      id: localId,
      method: 'POST',
      path: '/reports',
      body: JSON.stringify(jsonBody),
    });
    return report;
  }

  private mapReport(report: Report): Report {
    // la foto del api se reescribe a la ip que usa este dispositivo
    return {
      ...report,
      imageUrl: resolveMediaUrl(report.imageUrl, environment.apiUrl.replace(/\/api\/?$/, '')),
    };
  }

  private isNetworkError(err: unknown): boolean {
    // status 0: el navegador no obtuvo respuesta del servidor
    return err instanceof HttpErrorResponse && err.status === 0;
  }

  private toForm(payload: Partial<ReportPayload>): FormData {
    // multipart porque la evidencia viaja como archivo
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'image' || value === undefined || value === null || value === '') {
        return;
      }
      form.append(key, String(value));
    });
    if (payload.image) {
      form.append('image', payload.image, 'evidencia.jpg');
    }
    return form;
  }
}
