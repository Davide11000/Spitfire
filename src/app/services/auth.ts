import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Auth {
    private baseUrl = "http://localhost:3000/auth";
    private http = inject(HttpClient);

    login(id: string, password: string) : Observable<any>{
      return this.http.post(`${this.baseUrl}/login`, {id, password});
    }

    register(username: string, email: string, password: string): Observable<any>{
      return this.http.post(`${this.baseUrl}/register`, {username, email, password});
    }
    
    getProfile(token: string): Observable<any>{
      return this.http.get(`${this.baseUrl}/profile`, {
        headers: {Authorization: `Bearer ${token}`}
      });
    }

    getUserProfile(username: string): Observable<any> {
      return this.http.get(`http://localhost:3000/users/${username}`);
    }

    getUsernameFromToken(): string | null {
      const token = this.getToken();
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username;
      } catch {
        return null;
      }
    }

    saveToken(token: string): void {
      localStorage.setItem('token', token);
    }

    getToken(): string | null {
      return localStorage.getItem('token');
    }

    logout(): void {
      localStorage.removeItem('token');
    }
}
