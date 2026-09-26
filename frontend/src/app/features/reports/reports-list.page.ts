import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { ReportsService } from '../../core/services/reports.service';
import { REPORT_LABELS, type Report } from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.page.html',
  styleUrls: ['./reports-list.page.scss'],
  imports: [
    RouterLink,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSkeletonText,
    SiperilHeaderComponent,
  ],
})
export class ReportsListPage implements OnInit {
  reports: Report[] = [];
  loading = true;
  labels = REPORT_LABELS;

  constructor(
    private reportsApi: ReportsService,
    private alert: AlertController,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
  ) {}

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
}
