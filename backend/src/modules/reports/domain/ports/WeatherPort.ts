export interface WeatherPort {
  getSummary(lat: number, lon: number): Promise<string | null>;
}
