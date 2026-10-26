import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  bicycleOutline,
  bodyOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  constructOutline,
  layersOutline,
  medkitOutline,
  timeOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ReportsService } from '../../core/services/reports.service';
import {
  REPORT_LABELS,
  type Report,
  type ReportType,
} from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

type DateFilter = 'all' | 'today' | '7d' | '30d';

interface CountRow {
  key: string;
  label: string;
  short: string;
  icon: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    FormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    SiperilHeaderComponent,
  ],
})
export class AdminPage {
  reports: Report[] = [];
  filtered: Report[] = [];
  companies: string[] = [];
  company: string | null = null;
  dateFilter: DateFilter = 'all';
  total: number = 0;
  pending: number = 0;
  resolved: number = 0;
  pendingPercent: number = 0;
  resolvedPercent: number = 0;
  typeSummary: CountRow[] = [];
  companySummary: CountRow[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  labels: Record<ReportType, string> = REPORT_LABELS;

  private readonly typeMeta: Record<ReportType, { short: string; icon: string }> = {
    unsafe_condition: { short: 'Actos y condiciones', icon: 'alert-circle-outline' },
    work_accident: { short: 'Accidente de trabajo', icon: 'medkit-outline' },
    maintenance: { short: 'Mantenimiento', icon: 'construct-outline' },
    road_accident: { short: 'Accidente vial', icon: 'bicycle-outline' },
    height_equipment: { short: 'Equipos en alturas', icon: 'body-outline' },
  };

  constructor(
    public auth: AuthService,
    private reportsApi: ReportsService,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private alert: AlertController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({
      layersOutline,
      timeOutline,
      checkmarkCircleOutline,
      businessOutline,
      calendarOutline,
      alertCircleOutline,
      medkitOutline,
      constructOutline,
      bicycleOutline,
      bodyOutline,
    });
  }

  when(report: Report): string {
    const date = this.reportDate(report);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  initials(name?: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '—';
    }
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  async ionViewWillEnter(): Promise<void> {
    await this.load();
  }

  async load(event?: { detail: { complete: () => void } }): Promise<void> {
    this.loading = !event;
    this.errorMessage = null;
    this.cdr.detectChanges();
    try {
      // el admin trae todos los reportes y el filtro se aplica en el cliente
      this.reports = await this.reportsApi.list();
      this.companies = [...new Set(this.reports.map((r) => r.company).filter(Boolean))].sort();
      this.applyFilter();
    } catch {
      this.errorMessage = 'No se pudieron cargar los reportes. Revisa la conexión e inténtalo de nuevo.';
      this.reports = [];
      this.applyFilter();
    } finally {
      this.loading = false;
      event?.detail.complete();
      this.cdr.detectChanges();
    }
  }

  applyFilter(): void {
    // filtra en memoria por empresa y por rango de fechas
    this.filtered = this.reports.filter(
      (report) => this.matchesCompany(report) && this.matchesDate(report),
    );
    this.filtered.sort((a, b) => {
      // los pendientes quedan arriba y despues los mas recientes
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }
      return this.reportDate(b).getTime() - this.reportDate(a).getTime();
    });
    this.total = this.filtered.length;
    this.pending = this.filtered.filter((r) => r.status === 'pending').length;
    this.resolved = this.filtered.filter((r) => r.status === 'resolved').length;
    this.pendingPercent = this.percent(this.pending);
    this.resolvedPercent = this.percent(this.resolved);
    this.typeSummary = this.buildTypeSummary();
    this.companySummary = this.buildCompanySummary();
  }

  async markResolved(report: Report): Promise<void> {
    // confirma y llama al patch que cierra el hallazgo
    const alert = await this.alert.create({
      header: 'Marcar como resuelto',
      message: '¿Confirmas que este hallazgo ya fue atendido?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') {
      return;
    }
    const overlay = await this.loadingCtrl.create({ message: 'Actualizando…' });
    await overlay.present();
    try {
      const updated = await this.reportsApi.resolve(report.id);
      this.reports = this.reports.map((item) => (item.id === updated.id ? updated : item));
      this.applyFilter();
      const t = await this.toast.create({
        message: 'Reporte marcado como resuelto.',
        duration: 2000,
        color: 'success',
      });
      await t.present();
    } catch {
      const t = await this.toast.create({
        message: 'No se pudo actualizar el estado del reporte.',
        duration: 2500,
        color: 'danger',
      });
      await t.present();
    } finally {
      await overlay.dismiss();
      this.cdr.detectChanges();
    }
  }

  private matchesCompany(report: Report): boolean {
    return !this.company || report.company === this.company;
  }

  private matchesDate(report: Report): boolean {
    if (this.dateFilter === 'all') {
      return true;
    }
    const date = this.reportDate(report);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    const start = this.rangeStart();
    return date >= start;
  }

  private rangeStart(): Date {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (this.dateFilter === '7d') {
      start.setDate(start.getDate() - 6);
    } else if (this.dateFilter === '30d') {
      start.setDate(start.getDate() - 29);
    }
    return start;
  }

  private reportDate(report: Report): Date {
    return new Date(report.incidentDate || report.createdAt);
  }

  private percent(count: number): number {
    // porcentaje sobre el total ya filtrado, cero si no hay datos
    if (!this.total) {
      return 0;
    }
    return Math.round((count / this.total) * 100);
  }

  private buildTypeSummary(): CountRow[] {
    const types = Object.keys(this.labels) as ReportType[];
    return types.map((type) => {
      const count = this.filtered.filter((r) => r.reportType === type).length;
      const meta = this.typeMeta[type];
      return {
        key: type,
        label: this.labels[type],
        short: meta.short,
        icon: meta.icon,
        count,
        percent: this.percent(count),
      };
    });
  }

  private buildCompanySummary(): CountRow[] {
    const counts = new Map<string, number>();
    for (const report of this.filtered) {
      counts.set(report.company, (counts.get(report.company) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([company, count]) => ({
        key: company,
        label: company,
        short: company,
        icon: 'business-outline',
        count,
        percent: this.percent(count),
      }));
  }
}
