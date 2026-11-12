import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class RoleRequest {

    private baseUrl = "http://localhost:3000/role-requests";
    private http = inject(HttpClient);

    getMine() : Observable<any> {
        return this.http.get(`${this.baseUrl}/me`);
    }

    send(text: string) : Observable<any> {
        return this.http.post(`${this.baseUrl}`, { text });
    }

    getPending() : Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }

    accept(id: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/accept`, {});
    }

    reject(id: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/reject`, {});
    }
}
