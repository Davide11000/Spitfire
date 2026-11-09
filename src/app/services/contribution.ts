import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Contribution {
  private baseUrl = "http://localhost:3000/contributors";

  private http = inject(HttpClient);

  getContributors(type: string, id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${type}/${id}`);
  }
}
