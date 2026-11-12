import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Annotation {
  private baseUrl = "http://localhost:3000/annotations";

  private http = inject(HttpClient);


  getLatest(): Observable<any> {
    return this.http.get(`${this.baseUrl}/latest`);
  }

  getBySong(songId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/song/${songId}`);
  }

  create(songId: number, start: number, end: number, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {songId, start, end, text});
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
