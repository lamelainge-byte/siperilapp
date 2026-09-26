import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AUTH_RETRY = new HttpContextToken(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastController);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // un 401 fuera de auth intenta renovar la sesion una sola vez
      if (
        err.status === 401 &&
        !req.url.includes('/auth/') &&
        !req.context.get(AUTH_RETRY)
      ) {
        return from(auth.refresh()).pipe(
          switchMap((ok) => {
            if (!ok) {
              // si el refresh falla se cierra la sesion y vuelve al login
              void router.navigateByUrl('/auth');
              return throwError(() => err);
            }
            const token = auth.getAccessToken();
            return next(
              req.clone({
                // reintenta la misma peticion con el access nuevo
                setHeaders: { Authorization: `Bearer ${token ?? ''}` },
                context: req.context.set(AUTH_RETRY, true),
              }),
            );
          }),
        );
      }
      if (err.status === 401 && req.url.includes('/auth/')) {
        return throwError(() => err);
      }
      const message =
        err.error?.message ??
        // status 0 significa que el celular no alcanzo el api
        (err.status === 0
          ? 'Sin conexión con el API. En el celular usa la misma Wi‑Fi que el PC y deja el backend encendido.'
          : 'Ocurrió un error');
      void toast.create({ message, duration: 2800, color: 'danger' }).then((t) => t.present());
      return throwError(() => err);
    }),
  );
};
