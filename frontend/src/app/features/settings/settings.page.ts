import { Component } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonContent,
  IonToggle,
} from '@ionic/angular';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [IonContent, IonButton, IonToggle, SiperilHeaderComponent],
})
export class SettingsPage {
  constructor(
    public a11y: AccessibilityService,
    private alert: AlertController,
  ) {}

  async confirmReset(): Promise<void> {
    // pide confirmacion antes de volver accesibilidad al valor inicial
    const alert = await this.alert.create({
      header: '¿Restablecer configuración?',
      message: 'Se restaurarán las opciones de accesibilidad.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Restablecer', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.a11y.reset();
    }
  }
}
