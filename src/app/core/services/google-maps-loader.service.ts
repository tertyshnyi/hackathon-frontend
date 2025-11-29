import { Injectable } from '@angular/core';
import { environment } from '../../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private apiLoaded = false;

  load(): Promise<void> {
    return new Promise((resolve) => {
      if (this.apiLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.apiLoaded = true;
        resolve();
      };

      document.body.appendChild(script);
    });
  }
}
