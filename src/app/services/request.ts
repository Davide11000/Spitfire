import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Request {

    private baseUrl = "http://localhost:3000/requests";
    private http = inject(HttpClient);

    sendRequest(formData: FormData) : Observable<any> {
        return this.http.post(`${this.baseUrl}`, formData);
    }

    getMyRequests() : Observable<any> {
        return this.http.get(`${this.baseUrl}/me`);
    }

    getPendingRequests() : Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }

    acceptRequest(id: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/accept`, {});
    }

    rejectRequest(id: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/reject`, {});
    }
}
