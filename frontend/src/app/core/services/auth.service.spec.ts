import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { provideRouter } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('guarda tokens al iniciar sesión', async () => {
    const promise = service.login('ana@empresa.com', 'secreto123');
    const req = http.expectOne((r) => r.url.endsWith('/auth/login'));
    req.flush({
      accessToken: 'a',
      refreshToken: 'r',
      user: {
        id: '1',
        name: 'Ana',
        email: 'ana@empresa.com',
        company: 'Demo',
        role: 'worker',
      },
    });
    await promise;
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getAccessToken()).toBe('a');
  });
});
