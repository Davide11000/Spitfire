import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Comment {
  private baseUrl = "http://localhost:3000/comments";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  getComments(type: string, id: number, page: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}?type=${type}&id=${id}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getReplies(commentId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${commentId}/replies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  createComment(type: string, targetId: number, text: string, parentId: number | null = null): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}`, {type, targetId, text, parentId}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteComment(commentId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.delete(`${this.baseUrl}/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  vote(commentId: number, value: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/${commentId}/vote`, {value}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
