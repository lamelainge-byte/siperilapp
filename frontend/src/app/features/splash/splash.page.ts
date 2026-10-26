import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { SqliteService } from '../../core/services/sqlite.service';
import { SiperilLogoComponent } from '../../shared/brand/siperil-logo.component';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  imports: [IonContent, IonSpinner, SiperilLogoComponent],
})
export class SplashPage implements OnInit {
  private booted: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private sqlite: SqliteService,
  ) {}

  ngOnInit(): void {
    void this.boot();
  }

  ionViewDidEnter(): void {
    void this.boot();
  }

  private async boot(): Promise<void> {
    // ionViewDidEnter puede dispararse dos veces, esto lo evita
    if (this.booted) {
      return;
    }
    this.booted = true;
    try {
      // prepara sqlite y si tarda sigue igual hacia el api
      await Promise.race([
        this.sqlite.init(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SQLite timeout')), 4000),
        ),
      ]);
    } catch {
      // si sqlite no arranca la app sigue y usa el api
    }
    await new Promise((r) => setTimeout(r, 800));
    // con sesion entra al inicio y sin sesion al login
    await this.router.navigateByUrl(this.auth.isLoggedIn() ? '/home' : '/auth', {
      replaceUrl: true,
    });
  }
}
