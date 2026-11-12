import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class About {
  private baseUrl = "http://localhost:3000/abouts";

  private http = inject(HttpClient);


  getByTarget(targetType: string, targetId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${targetType}/${targetId}`);
  }

  create(targetType: string, targetId: number, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {targetType, targetId, text});
  }

  approve(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/reject`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  vote(id: number, value: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/vote`, {value});
  }

  proposeEdit(id: number, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/edits`, {text});
  }

  approveEdit(editId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/edits/${editId}/approve`, {});
  }

  rejectEdit(editId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/edits/${editId}/reject`, {});
  }
}
