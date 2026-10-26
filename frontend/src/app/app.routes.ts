import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    // splash decide si entra a home o al login
    loadComponent: () => import('./features/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'auth',
    canActivate: [guestGuard], // si ya hay sesion no deja volver al login
    loadComponent: () => import('./features/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'home',
    canActivate: [authGuard], // el resto de pantallas exige sesion
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reports/reports-list.page').then((m) => m.ReportsListPage),
  },
  {
    path: 'reports/new/:type',
    canActivate: [authGuard],
    // el tipo de la url elige cual formulario abrir
    loadComponent: () =>
      import('./features/reports/report-form.page').then((m) => m.ReportFormPage),
  },
  {
    path: 'reports/:id/edit',
    canActivate: [authGuard],
    // misma pantalla del formulario, pero cargando un reporte existente
    loadComponent: () =>
      import('./features/reports/report-form.page').then((m) => m.ReportFormPage),
  },
  {
    path: 'reports/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reports/report-detail.page').then((m) => m.ReportDetailPage),
  },
  {
    path: 'ingresos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/ingresos/ingresos.page').then((m) => m.IngresosPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard], // el panel solo lo abre un administrador
    loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage),
  },
];
