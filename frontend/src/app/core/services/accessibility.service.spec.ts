import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
  });

  it('aumenta y disminuye la escala de fuente dentro de límites', () => {
    const start = service.fontScale();
    service.increaseFont();
    expect(service.fontScale()).toBeGreaterThan(start);
    service.decreaseFont();
    expect(service.fontScale()).toBe(start);
  });

  it('no pasa del 140% ni del 80%', () => {
    for (let i = 0; i < 10; i++) {
      service.increaseFont();
    }
    expect(service.fontScale()).toBe(1.4);
    for (let i = 0; i < 20; i++) {
      service.decreaseFont();
    }
    expect(service.fontScale()).toBe(0.8);
  });

  it('texto grande usa la misma escala', () => {
    service.setLargeText(true);
    expect(service.largeText()).toBe(true);
    expect(service.fontScale()).toBeGreaterThanOrEqual(1.2);
    service.setLargeText(false);
    expect(service.fontScale()).toBe(1);
    expect(service.largeText()).toBe(false);
  });

  it('activa alto contraste en el documento', () => {
    service.setHighContrast(true);
    expect(service.highContrast()).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('restablece las preferencias', () => {
    service.increaseFont();
    service.setHighContrast(true);
    service.reset();
    expect(service.fontScale()).toBe(1);
    expect(service.highContrast()).toBe(false);
    expect(service.largeText()).toBe(false);
  });
});
