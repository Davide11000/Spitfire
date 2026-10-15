import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Song {
    private baseUrl = "http://localhost:3000/songs";
    private http = inject(HttpClient);

    getSongbyId(id: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }
}
