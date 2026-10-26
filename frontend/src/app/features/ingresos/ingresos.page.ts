import { ChangeDetectorRef, Component } from '@angular/core';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { AuthService, type AccessLog } from '../../core/services/auth.service';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.page.html',
  styleUrls: ['./ingresos.page.scss'],
  imports: [IonContent, IonRefresher, IonRefresherContent, SiperilHeaderComponent],
})
export class IngresosPage {
  logs: AccessLog[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    void this.load();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.load();
  }

  async load(event?: CustomEvent): Promise<void> {
    this.loading = this.logs.length === 0;
    this.errorMessage = null;
    try {
      this.logs = await this.auth.listIngresos();
    } catch {
      this.errorMessage = 'No se pudieron cargar los ingresos.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      const refresher = event?.target as { complete?: () => void } | undefined;
      refresher?.complete?.();
    }
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '—';
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  when(value: string): string {
    return new Date(value).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
