import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  bicycleOutline,
  bodyOutline,
  constructOutline,
  medkitOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ReportsService } from '../../core/services/reports.service';
import { REPORT_LABELS, type Report, type ReportType } from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

type StatusFilter = 'all' | 'pending' | 'resolved';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.page.html',
  styleUrls: ['./reports-list.page.scss'],
  imports: [
    RouterLink,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonSkeletonText,
    SiperilHeaderComponent,
  ],
})
export class ReportsListPage implements OnInit {
  reports: Report[] = [];
  visible: Report[] = [];
  statusFilter: StatusFilter = 'all';
  loading: boolean = true;
  labels: Record<ReportType, string> = REPORT_LABELS;

  private readonly typeIcons: Record<ReportType, string> = {
    unsafe_condition: 'alert-circle-outline',
    work_accident: 'medkit-outline',
    maintenance: 'construct-outline',
    road_accident: 'bicycle-outline',
    height_equipment: 'body-outline',
  };

  constructor(
    public auth: AuthService,
    private reportsApi: ReportsService,
    private alert: AlertController,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({
      alertCircleOutline,
      medkitOutline,
      constructOutline,
      bicycleOutline,
      bodyOutline,
    });
  }

  get pendingCount(): number {
    return this.reports.filter((report) => report.status === 'pending').length;
  }

  get resolvedCount(): number {
    return this.reports.filter((report) => report.status === 'resolved').length;
  }

  setFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
    this.applyView();
    this.cdr.detectChanges();
  }

  typeIcon(type: ReportType): string {
    return this.typeIcons[type];
  }

  when(report: Report): string {
    const date = new Date(report.incidentDate || report.createdAt);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  ngOnInit(): void {
    void this.load();
  }

  async load(event?: { detail: { complete: () => void } }): Promise<void> {
    this.loading = !event;
    this.cdr.detectChanges();
    try {
      // pide los reportes del usuario y si tarda mas de 8 segundos muestra lista vacia
      this.reports = await Promise.race([
        this.reportsApi.list(),
        new Promise<Report[]>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000),
        ),
      ]);
    } catch {
      this.reports = [];
    } finally {
      this.applyView();
      this.loading = false;
      event?.detail.complete();
      this.cdr.detectChanges();
    }
  }

  async remove(report: Report): Promise<void> {
    // pide confirmacion porque el borrado no se deshace
    const alert = await this.alert.create({
      header: 'Eliminar reporte',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') {
      return;
    }
    const overlay = await this.loadingCtrl.create({ message: 'Eliminando…' });
    await overlay.present();
    try {
      await this.reportsApi.remove(report.id);
      // saca la fila de la lista sin volver a pedir el api
      this.reports = this.reports.filter((r) => r.id !== report.id);
      this.applyView();
      const t = await this.toast.create({
        message: 'Reporte eliminado.',
        duration: 1800,
        color: 'success',
      });
      await t.present();
    } finally {
      await overlay.dismiss();
      this.cdr.detectChanges();
    }
  }

  private applyView(): void {
    this.visible =
      this.statusFilter === 'all'
        ? this.reports
        : this.reports.filter((report) => report.status === this.statusFilter);
  }
}
