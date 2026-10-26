import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonIcon,
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
import {
  DAMAGE_KIND_LABELS,
  EQUIPMENT_LABELS,
  REPORT_LABELS,
  type EquipmentDamageKind,
  type HeightEquipment,
  type Report,
  type ReportType,
} from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.page.html',
  styleUrls: ['./report-detail.page.scss'],
  imports: [RouterLink, IonContent, IonButton, IonIcon, SiperilHeaderComponent],
})
export class ReportDetailPage {
  report: Report | null = null;
  labels: Record<ReportType, string> = REPORT_LABELS;
  loadError: boolean = false;

  private readonly typeIcons: Record<ReportType, string> = {
    unsafe_condition: 'alert-circle-outline',
    work_accident: 'medkit-outline',
    maintenance: 'construct-outline',
    road_accident: 'bicycle-outline',
    height_equipment: 'body-outline',
  };

  equipmentLabel(value: string | null | undefined): string {
    if (!value) return '—';
    return EQUIPMENT_LABELS[value as HeightEquipment] ?? value;
  }

  damageLabel(value: string | null | undefined): string {
    if (!value) return '—';
    return DAMAGE_KIND_LABELS[value as EquipmentDamageKind] ?? value;
  }

  constructor(
    private route: ActivatedRoute,
    private reports: ReportsService,
    private loadingCtrl: LoadingController,
    public auth: AuthService,
    private alert: AlertController,
    private toast: ToastController,
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

  typeIcon(type: ReportType): string {
    return this.typeIcons[type];
  }

  when(value: string | null | undefined): string {
    if (!value) return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Bogota',
    });
  }

  clock(value: string | null | undefined): string | null {
    if (!value) return null;
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return value;
    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  shiftLabel(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  mapsUrl(report: Report): string | null {
    if (report.latitude == null || report.longitude == null) return null;
    return `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  }

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
