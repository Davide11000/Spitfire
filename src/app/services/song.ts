import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Song {

    private baseUrl = "http://localhost:3000/songs";
    private http = inject(HttpClient);

    search(text: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/search?q=${text}`);
    }

    getSongbyId(id: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    getSongsbyRecordID(id: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/record/${id}`);
    }

    getTranslations(id: number) : Observable<any> {
        return this.http.get(`http://localhost:3000/lyrics/song/${id}`);
    }
}
