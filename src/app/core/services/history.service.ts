import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, delay } from 'rxjs';
import { HistoryItem, HistoryResponse } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly apiUrl = 'assets/history.json';

  constructor(private http: HttpClient) {}

  getHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryResponse>(this.apiUrl).pipe(
      delay(300), // Emulate network delay
      map(response => response.historyItems.map(item => ({
        ...item,
        date: new Date(item.date)
      })))
    );
  }
}

