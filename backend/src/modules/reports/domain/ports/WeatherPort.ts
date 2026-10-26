// contrato del clima, createreport lo llama si hay coordenadas, openweatheradapter lo implementa
export interface WeatherPort {
  getSummary(lat: number, lon: number): Promise<string | null>;
}
