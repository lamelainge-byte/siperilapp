import { Component, Input } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonMenuButton, IonToolbar } from '@ionic/angular';
import { SiperilLogoComponent } from '../brand/siperil-logo.component';

@Component({
  selector: 'app-siperil-header',
  templateUrl: './siperil-header.component.html',
  styleUrls: ['./siperil-header.component.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonBackButton, SiperilLogoComponent],
})
export class SiperilHeaderComponent {
  @Input() title: string = '';
  @Input() showMenu: boolean = false; // abre el menu lateral
  @Input() showBack: boolean = false; // flecha para volver
  @Input() defaultHref: string = '/home'; // destino si no hay historial
}
