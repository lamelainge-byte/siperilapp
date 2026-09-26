import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthResponse, User } from '../../models/siperil.models';
import { SqliteService } from './sqlite.service';

const ACCESS = 'siperil.access';
const REFRESH = 'siperil.refresh';
const USER = 'siperil.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(this.readUser());
  readonly user = this.userSignal.asReadonly();
  // la interfaz reacciona sola cuando cambia el usuario
  readonly isLoggedIn = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');
  // evita pedir varios refresh a la vez
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sqlite: SqliteService,
  ) {}

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH);
  }

  persist(auth: AuthResponse): void {
    // access, refresh y perfil quedan en el dispositivo
    localStorage.setItem(ACCESS, auth.accessToken);
    localStorage.setItem(REFRESH, auth.refreshToken);
    localStorage.setItem(USER, JSON.stringify(auth.user));
    this.userSignal.set(auth.user);
    void this.sqlite.saveProfile(auth.user).catch(() => undefined);
  }

  // el registro no guarda tokens, el usuario entra despues por login
  async register(payload: {
    name: string;
    email: string;
    company: string;
    password: string;
  }): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/register`, payload));
  }

  async login(email: string, password: string): Promise<void> {
    // pide los tokens y los deja en localstorage y en el signal
    const auth = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }),
    );
    this.persist(auth);
  }

  async refresh(): Promise<boolean> {
    // varias peticiones fallidas comparten una sola renovacion
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    this.refreshInFlight = this.doRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }
    try {
      const auth = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }),
      );
      this.persist(auth);
      return true;
    } catch {
      // refresh invalido: se borra la sesion local
      this.clearLocal();
      return false;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }),
      );
    } catch {
      // si el logout falla en red igual se limpia la sesion local
    }
    this.clearLocal();
    await this.router.navigateByUrl('/auth');
  }

  clearLocal(): void {
    // saca access, refresh y perfil del dispositivo
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
    this.userSignal.set(null);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
