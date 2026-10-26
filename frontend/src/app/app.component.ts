import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterLink,
  IonRouterOutlet,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  clipboardOutline,
  homeOutline,
  logOutOutline,
  settingsOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';
import { AccessibilityService } from './core/services/accessibility.service';
import { AuthService } from './core/services/auth.service';
import { SiperilLogoComponent } from './shared/brand/siperil-logo.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonMenuToggle,
    IonRouterLink,
    IonRouterOutlet,
    IonIcon,
    SiperilLogoComponent,
  ],
})
export class AppComponent {
  showNav: boolean = false;

  constructor(
    public auth: AuthService,
    router: Router,
    _a11y: AccessibilityService,
  ) {
    addIcons({
      homeOutline,
      clipboardOutline,
      shieldCheckmarkOutline,
      settingsOutline,
      logOutOutline,
    });
    // la barra inferior solo aparece con sesion y fuera de splash y login
    router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const url = e.urlAfterRedirects.split('?')[0];
      this.showNav = this.auth.isLoggedIn() && url !== '/' && !url.startsWith('/auth');
    });
  }

  get showBottomNav(): boolean {
    // la barra inferior depende de la sesion y de la ruta actual
    return this.auth.isLoggedIn() && this.showNav;
  }
}
