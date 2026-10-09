import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Follow {
  private baseUrl = "http://localhost:3000/follows";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  followUser(username: string): Observable<any> {
    const token = this.auth.getToken();
    return this.http.post(`${this.baseUrl}/${username}/follow`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  unfollowUser(username: string): Observable<any> {
    const token = this.auth.getToken();
    return this.http.delete(`${this.baseUrl}/${username}/follow`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getFollowers(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}/followers`);
  }

  getFollowing(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}/following`);
  }
}