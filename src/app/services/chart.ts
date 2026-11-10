import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Chart {
  private baseUrl = "http://localhost:3000/charts";

  private http = inject(HttpClient);

  getChart(type: string, year: string, genre: string, page: number): Observable<any> {
    let url = `${this.baseUrl}?type=${type}&page=${page}`;
    if (year) url += `&year=${year}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    return this.http.get(url);
  }

  getYears(): Observable<any> {
    return this.http.get(`${this.baseUrl}/years`);
  }
}
