import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  bicycleOutline,
  constructOutline,
  medkitOutline,
  shieldCheckmarkOutline,
  bodyOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import type { ReportType } from '../../models/siperil.models';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [RouterLink, IonContent, IonButton, IonIcon, SiperilHeaderComponent],
})
export class HomePage {
  // cada tarjeta abre el formulario de ese tipo de reporte
  types: { type: ReportType; label: string; icon: string }[] = [
    { type: 'unsafe_condition', label: 'Actos y condiciones inseguras', icon: 'alert-circle-outline' },
    { type: 'work_accident', label: 'Accidente de trabajo', icon: 'medkit-outline' },
    { type: 'maintenance', label: 'Registro de mantenimiento', icon: 'construct-outline' },
    { type: 'road_accident', label: 'Accidente vial', icon: 'bicycle-outline' },
    { type: 'height_equipment', label: 'Daño de equipos de trabajo en alturas', icon: 'body-outline' },
  ];

  constructor(public auth: AuthService) {
    addIcons({
      alertCircleOutline,
      medkitOutline,
      constructOutline,
      bicycleOutline,
      shieldCheckmarkOutline,
      bodyOutline,
    });
  }
}
