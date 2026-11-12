import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Rating {
  private baseUrl = "http://localhost:3000/ratings";

  private http = inject(HttpClient);


  getRating(type: string, id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${type}/${id}`);
  }

  rate(type: string, id: number, value: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${type}/${id}`, {value});
  }

  getDistribution(type: string, id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${type}/${id}/distribution`);
  }

  getUserDistribution(username: string, type: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${username}/${type}`);
  }

  removeRating(type: string, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${type}/${id}`);
  }
}
