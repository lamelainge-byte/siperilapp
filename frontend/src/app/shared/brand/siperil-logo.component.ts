import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-siperil-logo',
  templateUrl: './siperil-logo.component.html',
  styleUrls: ['./siperil-logo.component.scss'],
})
export class SiperilLogoComponent {
  // compacto para el header de android
  @Input() compact: boolean = false;
  @Input() hero: boolean = false;
  @Input() dark: boolean = false;
  broken: boolean = false;
}
