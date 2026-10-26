import { Injectable, computed, signal } from '@angular/core';

const FONT_KEY = 'siperil.fontScale';
const CONTRAST_KEY = 'siperil.highContrast';
const LARGE_TEXT_KEY = 'siperil.largeText';

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const STEP = 0.1;
const DEFAULT_SCALE = 1;
const LARGE_TEXT_SCALE = 1.2;

/**
 * guarda en el dispositivo el tamano de letra y el alto contraste
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly fontScale = signal<number>(this.readScale());
  readonly highContrast = signal<boolean>(this.readBool(CONTRAST_KEY));
  readonly largeText = computed<boolean>(() => this.fontScale() >= LARGE_TEXT_SCALE);
  readonly fontPercent = computed<number>(() => Math.round(this.fontScale() * 100));
  readonly canDecrease = computed<boolean>(() => this.fontScale() > MIN_SCALE);
  readonly canIncrease = computed<boolean>(() => this.fontScale() < MAX_SCALE);

  constructor() {
    if (this.readBool(LARGE_TEXT_KEY) && this.fontScale() < LARGE_TEXT_SCALE) {
      this.fontScale.set(LARGE_TEXT_SCALE);
      this.persist();
      return;
    }
    this.apply();
  }

  increaseFont(): void {
    this.setScale(this.fontScale() + STEP);
  }

  decreaseFont(): void {
    this.setScale(this.fontScale() - STEP);
  }

  setLargeText(enabled: boolean): void {
    if (enabled) {
      this.setScale(Math.max(this.fontScale(), LARGE_TEXT_SCALE));
      return;
    }
    if (this.fontScale() >= LARGE_TEXT_SCALE) {
      this.setScale(DEFAULT_SCALE);
    }
  }

  setHighContrast(value: boolean): void {
    // el valor queda en el signal y en localstorage
    this.highContrast.set(value);
    this.persist();
  }

  reset(): void {
    // vuelve letra y contraste a los valores de fabrica
    this.fontScale.set(DEFAULT_SCALE);
    this.highContrast.set(false);
    this.persist();
  }

  private setScale(value: number): void {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +value.toFixed(2)));
    this.fontScale.set(next);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(FONT_KEY, String(this.fontScale()));
    localStorage.setItem(CONTRAST_KEY, String(this.highContrast()));
    localStorage.setItem(LARGE_TEXT_KEY, String(this.largeText()));
    this.apply();
  }

  private apply(): void {
    // escribe la escala en una variable css y prende o apaga el contraste
    const root = document.documentElement;
    root.style.setProperty('--siperil-font-scale', String(this.fontScale()));
    root.classList.toggle('high-contrast', this.highContrast());
  }

  private readScale(): number {
    const n = this.readNumber(FONT_KEY, DEFAULT_SCALE);
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
  }

  private readNumber(key: string, fallback: number): number {
    const raw = localStorage.getItem(key);
    const n = raw ? Number(raw) : fallback;
    return Number.isFinite(n) ? n : fallback;
  }

  private readBool(key: string): boolean {
    return localStorage.getItem(key) === 'true';
  }
}
