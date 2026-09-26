import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  // login, registro y refresh van sin token para no mandar uno vencido
  if (!token || req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh')) {
    return next(req);
  }
  return next(
    req.clone({
      // todas las rutas protegidas salen con el access token
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
