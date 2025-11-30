import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryItem, SearchRequest } from '../models/history.model';
import { API_CONFIG } from '../config/api.config';
import { Coordinates } from './geolocation.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(private http: HttpClient) {}

  getHistory(userId: string): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(
      `${API_CONFIG.baseUrl}/searches/history?userId=${userId}`
    );
  }

  createSearch(userId: string, query: string, location: Coordinates): Observable<HistoryItem> {
    const body: SearchRequest = {
      userId,
      query,
      type: 'map',
      latitude: location.latitude,
      longitude: location.longitude
    };
    return this.http.post<HistoryItem>(`${API_CONFIG.baseUrl}/searches`, body);
  }
}
