import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Request {

    private baseUrl = "http://localhost:3000/requests";
    private http = inject(HttpClient);
    private auth = inject(Auth);

    // I dati vanno mandati come FormData perché insieme può esserci l'immagine
    sendRequest(formData: FormData) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getMyRequests() : Observable<any> {
        const token = this.auth.getToken();

        return this.http.get(`${this.baseUrl}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
