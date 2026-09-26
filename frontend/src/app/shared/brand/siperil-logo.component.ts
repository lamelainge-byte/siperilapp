import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-siperil-logo',
  templateUrl: './siperil-logo.component.html',
  styleUrls: ['./siperil-logo.component.scss'],
})
export class SiperilLogoComponent {
  // compacto para el header de android
  @Input() compact = false;
  @Input() dark = false;
  broken = false;
}
