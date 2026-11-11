import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class RoleRequest {

    private baseUrl = "http://localhost:3000/role-requests";
    private http = inject(HttpClient);
    private auth = inject(Auth);

    getMine() : Observable<any> {
        const token = this.auth.getToken();

        return this.http.get(`${this.baseUrl}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    send(text: string) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}`, { text }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getPending() : Observable<any> {
        const token = this.auth.getToken();

        return this.http.get(`${this.baseUrl}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    accept(id: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}/${id}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    reject(id: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}/${id}/reject`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
