import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private currentPosition = new BehaviorSubject<Coordinates | null>(null);
  private watchId: number | null = null;
  private isWatching = false;

  constructor() {}

  startWatching(): void {
    if (this.isWatching || !navigator.geolocation) {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
      }
      return;
    }

    this.isWatching = true;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => this.updatePosition(position),
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true }
    );

    // Watch for position changes
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.updatePosition(position),
      (error) => console.error('Error watching location:', error),
      { enableHighAccuracy: true }
    );
  }

  private updatePosition(position: GeolocationPosition): void {
    this.currentPosition.next({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }

  getCurrentPosition(): Coordinates | null {
    return this.currentPosition.value;
  }

  getPosition$(): Observable<Coordinates | null> {
    return this.currentPosition.asObservable();
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }
}

