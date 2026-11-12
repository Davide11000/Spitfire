import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class About {
  private baseUrl = "http://localhost:3000/abouts";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  private headers() {
    return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
  }

  getByTarget(targetType: string, targetId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${targetType}/${targetId}`, this.headers());
  }

  create(targetType: string, targetId: number, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {targetType, targetId, text}, this.headers());
  }

  approve(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/approve`, {}, this.headers());
  }

  reject(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/reject`, {}, this.headers());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.headers());
  }

  vote(id: number, value: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/vote`, {value}, this.headers());
  }

  proposeEdit(id: number, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/edits`, {text}, this.headers());
  }

  approveEdit(editId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/edits/${editId}/approve`, {}, this.headers());
  }

  rejectEdit(editId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/edits/${editId}/reject`, {}, this.headers());
  }
}
