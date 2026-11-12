import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Report {
  private baseUrl = "http://localhost:3000/reports";

  private http = inject(HttpClient);

  reportComment(commentId: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {commentId, reason});
  }

  reportAnnotation(annotationId: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/annotations`, {annotationId, reason});
  }

  getAnnotationReports(): Observable<any> {
    return this.http.get(`${this.baseUrl}/annotations`);
  }

  acceptAnnotationReport(reportId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/annotations/${reportId}/accept`, {});
  }

  rejectAnnotationReport(reportId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/annotations/${reportId}/reject`, {});
  }

  getReports(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  acceptReport(reportId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${reportId}/accept`, {});
  }

  rejectReport(reportId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${reportId}/reject`, {});
  }
}
