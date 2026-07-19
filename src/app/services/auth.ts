import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private baseUrl = "http://localhost:3000/auth";

  constructor(private http: HttpClient) {}

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
}
