import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_LOCATIONS } from '../models/mock-locations';

export interface Location {
  long: number;
  lat: number;
  address: string;
  category: string;
  name: string;
  reviews: number;
  count_reviews: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  getLocations(): Observable<Location[]> {
    return of(MOCK_LOCATIONS);
  }
}