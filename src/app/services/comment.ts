import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Comment {
  private baseUrl = "http://localhost:3000/comments";

  private http = inject(HttpClient);

  getComments(type: string, id: number, page: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=${type}&id=${id}&page=${page}`);
  }

  getReplies(commentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${commentId}/replies`);
  }

  createComment(type: string, targetId: number, text: string, parentId: number | null = null): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {type, targetId, text, parentId});
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${commentId}`);
  }

  vote(commentId: number, value: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${commentId}/vote`, {value});
  }
}
