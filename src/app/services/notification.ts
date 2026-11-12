import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Notification {
  private baseUrl = "http://localhost:3000/notifications";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  public unread = 0;
  private timer: any = null;

  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread`);
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}/read`, {});
  }

  startPolling() {
    if (this.timer) return;

    this.refreshUnread();
    this.timer = setInterval(() => { this.refreshUnread(); }, 10000);
  }

  refreshUnread() {
    if (!this.auth.getUsernameFromToken()) {
      this.unread = 0;
      return;
    }

    this.getUnreadCount().subscribe({
      next: (res) => { this.unread = res.unread; },
      error: (err) => { console.error('Error fetching notifications', err); }
    });
  }
}
