import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Artist {

    private baseUrl = "http://localhost:3000/artists";
    private http = inject(HttpClient);

    getArtist(id: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    getRecords(id: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}/records`);
    }
}
