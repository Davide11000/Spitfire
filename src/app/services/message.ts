import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Message {
  private baseUrl = "http://localhost:3000/messages";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  getConversations(): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getUnreadCount(): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/unread`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getChat(username: string, afterId: number = 0): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${username}?after=${afterId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  isBlocked(username: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${username}/block`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  block(username: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/${username}/block`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  unblock(username: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.delete(`${this.baseUrl}/${username}/block`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  sendMessage(username: string, text: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/${username}`, {text}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
