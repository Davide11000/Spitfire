import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Follow {
  private baseUrl = "http://localhost:3000/follows";

  private http = inject(HttpClient);

  followUser(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${username}/follow`, {});
  }

  unfollowUser(username: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${username}/follow`);
  }

  getFollowers(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}/followers`);
  }

  getFollowing(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}/following`);
  }
}