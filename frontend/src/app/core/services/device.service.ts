import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  /**
   * pide permiso de camara o galeria y devuelve la foto lista para enviar
   */
  async takePhoto(): Promise<{ dataUrl: string; blob: Blob } | null> {
    const perm = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    if (perm.camera !== 'granted' && perm.photos !== 'granted') {
      throw new Error('Permiso de cámara o galería denegado. Actívalo en ajustes del dispositivo.');
    }
    const photo = await Camera.getPhoto({
      quality: 75,
      width: 1920,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // el usuario elige camara o galeria
    });
    if (!photo.dataUrl) {
      return null;
    }
    const blob = await (await fetch(photo.dataUrl)).blob();
    return { dataUrl: photo.dataUrl, blob };
  }

  /**
   * pide permiso de ubicacion y devuelve latitud y longitud del incidente
   */
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted') {
      throw new Error('Permiso de ubicación denegado. Puedes escribir el lugar manualmente.');
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true, // gps fino para el punto del incidente
      timeout: 12000,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  }
}
