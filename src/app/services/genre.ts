import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Genre {

    private baseUrl = "http://localhost:3000/genres";
    private http = inject(HttpClient);

    getAllGenres() : Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }

    getRecordGenres(recordId: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/record/${recordId}`);
    }

    getSongGenres(songId: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/song/${songId}`);
    }

    getRecordsByGenre(genreId: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${genreId}/records`);
    }

    getSongsByGenre(genreId: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${genreId}/songs`);
    }
}
