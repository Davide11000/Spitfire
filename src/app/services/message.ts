import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Message {
  private baseUrl = "http://localhost:3000/messages";

  private http = inject(HttpClient);

  getConversations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/conversations`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread`);
  }

  getChat(username: string, afterId: number = 0): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}?after=${afterId}`);
  }

  isBlocked(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}/block`);
  }

  block(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${username}/block`, {});
  }

  unblock(username: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${username}/block`);
  }

  sendMessage(username: string, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${username}`, {text});
  }
}
