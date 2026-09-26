import type { WeatherPort } from '../../domain/ports/WeatherPort.js';

export class OpenWeatherAdapter implements WeatherPort {
  constructor(private readonly apiKey: string) {}

  async getSummary(lat: number, lon: number): Promise<string | null> {
    // sin clave o si el clima falla el reporte sigue sin resumen
    if (!this.apiKey) return null;
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('appid', this.apiKey);
    url.searchParams.set('units', 'metric');
    url.searchParams.set('lang', 'es');
    const response = await fetch(url);
    // un fallo del clima no tumba el guardado del reporte
    if (!response.ok) return null;
    const data = (await response.json()) as {
      weather?: { description?: string }[];
      main?: { temp?: number };
      name?: string;
    };
    const desc = data.weather?.[0]?.description ?? 'sin descripción';
    const temp = data.main?.temp;
    const place = data.name ?? '';
    return `${place} ${temp ?? '?'}°C, ${desc}`.trim();
  }
}
