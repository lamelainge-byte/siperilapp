import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ReportsService } from '../../core/services/reports.service';
import { REPORT_LABELS, type Report } from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.page.html',
  styleUrls: ['./report-detail.page.scss'],
  imports: [RouterLink, IonContent, IonButton, SiperilHeaderComponent],
})
export class ReportDetailPage {
  report: Report | null = null;
  labels = REPORT_LABELS;
  loadError = false;

  constructor(
    private route: ActivatedRoute,
    private reports: ReportsService,
    private loadingCtrl: LoadingController,
    public auth: AuthService,
    private alert: AlertController,
    private toast: ToastController,
    private cdr: ChangeDetectorRef,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    // cada vez que se abre el detalle se vuelve a pedir el reporte
    const id = this.route.snapshot.paramMap.get('id')!;
    const overlay = await this.loadingCtrl.create({ message: 'Cargando…' });
    await overlay.present();
    this.loadError = false;
    try {
      this.report = await this.reports.get(id);
    } catch {
      this.report = null;
      this.loadError = true;
    } finally {
      await overlay.dismiss();
      this.cdr.detectChanges();
    }
  }

  async markResolved(): Promise<void> {
    // solo un admin puede cerrar un reporte que sigue pendiente
    if (!this.report || this.report.status !== 'pending' || !this.auth.isAdmin()) {
      return;
    }
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
      this.report = await this.reports.resolve(this.report.id);
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
}
