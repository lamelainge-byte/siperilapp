import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { DeviceService } from '../../core/services/device.service';
import { ReportsService } from '../../core/services/reports.service';
import {
  DAMAGE_KIND_LABELS,
  EQUIPMENT_LABELS,
  REPORT_LABELS,
  type EquipmentDamageKind,
  type HeightEquipment,
  type ReportType,
} from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.page.html',
  styleUrls: ['./report-form.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    IonNote,
    IonButton,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    SiperilHeaderComponent,
  ],
})
export class ReportFormPage implements OnInit {
  reportType: ReportType = 'unsafe_condition';
  reportId: string | null = null;
  preview: string | null = null;
  imageBlob: Blob | null = null;
  weatherHint: string | null = null;
  loading: boolean = false;

  form = this.fb.nonNullable.group({
    // la descripcion es el unico campo siempre obligatorio
    description: ['', [Validators.required, Validators.minLength(5)]],
    incidentDate: [''],
    incidentTime: [''],
    shift: [''],
    place: [''],
    office: [''],
    equipmentType: [''],
    damageKind: [''],
    latitude: [''],
    longitude: [''],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reports: ReportsService,
    private device: DeviceService,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private alert: AlertController,
  ) {}

  get title(): string {
    // el titulo del formulario sale del tipo de reporte
    return REPORT_LABELS[this.reportType];
  }

  get needsShift(): boolean {
    // el turno solo aplica al accidente de trabajo
    return this.reportType === 'work_accident';
  }

  get needsDateTime(): boolean {
    // la condicion insegura no pide fecha ni hora
    return this.reportType !== 'unsafe_condition';
  }

  get isHeightEquipment(): boolean {
    return this.reportType === 'height_equipment';
  }

  get equipmentOptions(): HeightEquipment[] {
    return Object.keys(EQUIPMENT_LABELS) as HeightEquipment[];
  }

  get damageOptions(): EquipmentDamageKind[] {
    return Object.keys(DAMAGE_KIND_LABELS) as EquipmentDamageKind[];
  }

  equipmentLabel(value: HeightEquipment): string {
    return EQUIPMENT_LABELS[value];
  }

  damageLabel(value: EquipmentDamageKind): string {
    return DAMAGE_KIND_LABELS[value];
  }

  async ngOnInit(): Promise<void> {
    // al crear llega el tipo y al editar llega el id del reporte
    this.reportType = (this.route.snapshot.paramMap.get('type') as ReportType) ?? 'unsafe_condition';
    this.reportId = this.route.snapshot.paramMap.get('id');
    this.applyTypeValidators();
    if (this.reportId) {
      const overlay = await this.loadingCtrl.create({ message: 'Cargando reporte…' });
      await overlay.present();
      try {
        const report = await this.reports.get(this.reportId);
        this.reportType = report.reportType;
        this.applyTypeValidators();
        this.form.patchValue({
          description: report.description,
          incidentDate: report.incidentDate?.slice(0, 10) ?? '',
          incidentTime: report.incidentTime ?? '',
          shift: report.shift ?? '',
          place: report.place ?? '',
          office: report.office ?? '',
          equipmentType: report.equipmentType ?? '',
          damageKind: report.damageKind ?? '',
          latitude: report.latitude != null ? String(report.latitude) : '',
          longitude: report.longitude != null ? String(report.longitude) : '',
        });
        this.preview = report.imageUrl;
        this.weatherHint = report.weatherSummary;
      } finally {
        await overlay.dismiss();
      }
    }
  }

  private applyTypeValidators(): void {
    const date = this.form.controls.incidentDate;
    const place = this.form.controls.place;
    const office = this.form.controls.office;
    const equipmentType = this.form.controls.equipmentType;
    const damageKind = this.form.controls.damageKind;
    if (this.isHeightEquipment) {
      date.setValidators([Validators.required]);
      place.setValidators([Validators.required, Validators.minLength(2)]);
      office.setValidators([Validators.required, Validators.minLength(2)]);
      equipmentType.setValidators([Validators.required]);
      damageKind.setValidators([Validators.required]);
    }
    date.updateValueAndValidity();
    place.updateValueAndValidity();
    office.updateValueAndValidity();
    equipmentType.updateValueAndValidity();
    damageKind.updateValueAndValidity();
  }

  async capturePhoto(): Promise<void> {
    // guarda la vista previa y el archivo que luego viaja en el formulario
    try {
      const photo = await this.device.takePhoto();
      if (!photo) {
        return;
      }
      this.preview = photo.dataUrl;
      this.imageBlob = photo.blob;
    } catch (e) {
      const t = await this.toast.create({
        message: e instanceof Error ? e.message : 'No se pudo usar la cámara.',
        duration: 2800,
        color: 'warning',
      });
      await t.present();
    }
  }

  async captureLocation(): Promise<void> {
    // llena latitud y longitud, el clima se pide al guardar en el backend
    try {
      const pos = await this.device.getCurrentPosition();
      this.form.patchValue({
        latitude: String(pos.latitude),
        longitude: String(pos.longitude),
      });
      const t = await this.toast.create({
        message: 'Ubicación capturada. El clima se consultará al guardar.',
        duration: 2200,
        color: 'success',
      });
      await t.present();
    } catch (e) {
      const t = await this.toast.create({
        message: e instanceof Error ? e.message : 'No se pudo obtener la ubicación.',
        duration: 2800,
        color: 'warning',
      });
      await t.present();
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      // marca los campos para que se vea el error en rojo
      this.form.markAllAsTouched();
      const t = await this.toast.create({
        message: 'Revisa los campos marcados en rojo.',
        duration: 2200,
        color: 'danger',
      });
      await t.present();
      return;
    }

    const confirm = await this.alert.create({
      header: this.reportId ? '¿Guardar cambios?' : '¿Enviar reporte?',
      message: 'Confirma para continuar.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm' },
      ],
    });
    await confirm.present();
    const { role } = await confirm.onDidDismiss();
    if (role !== 'confirm') {
      return;
    }

    this.loading = true;
    const overlay = await this.loadingCtrl.create({ message: 'Enviando…' });
    await overlay.present();
    const v = this.form.getRawValue();
    const payload = {
      reportType: this.reportType,
      description: v.description,
      incidentDate: v.incidentDate || null,
      incidentTime: v.incidentTime || null,
      shift: v.shift || null,
      place: v.place || null,
      office: v.office || null,
      equipmentType: v.equipmentType || null,
      damageKind: v.damageKind || null,
      latitude: v.latitude ? Number(v.latitude) : null,
      longitude: v.longitude ? Number(v.longitude) : null, // el backend consulta el clima con estas coordenadas
      image: this.imageBlob,
    };
    try {
      if (this.reportId) {
        // con id es edicion, sin id es un reporte nuevo
        await this.reports.update(this.reportId, payload);
      } else {
        await this.reports.create(payload);
      }
      const t = await this.toast.create({
        message: 'Reporte guardado correctamente.',
        duration: 2200,
        color: 'success',
      });
      await t.present();
      await this.router.navigateByUrl('/reports');
    } catch {
      // el interceptor ya muestra el error
    } finally {
      this.loading = false;
      await overlay.dismiss();
    }
  }
}
