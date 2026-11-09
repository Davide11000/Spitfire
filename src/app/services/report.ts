import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Report {
  private baseUrl = "http://localhost:3000/reports";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  reportComment(commentId: number, reason: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}`, {commentId, reason}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  reportAnnotation(annotationId: number, reason: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/annotations`, {annotationId, reason}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getAnnotationReports(): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/annotations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  acceptAnnotationReport(reportId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/annotations/${reportId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  rejectAnnotationReport(reportId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/annotations/${reportId}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getReports(): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  acceptReport(reportId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/${reportId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  rejectReport(reportId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/${reportId}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
