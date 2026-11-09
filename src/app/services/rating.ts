import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Rating {
  private baseUrl = "http://localhost:3000/ratings";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  private headers() {
    return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
  }

  getRating(type: string, id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${type}/${id}`, this.headers());
  }

  rate(type: string, id: number, value: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${type}/${id}`, {value}, this.headers());
  }

  removeRating(type: string, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${type}/${id}`, this.headers());
  }
}
