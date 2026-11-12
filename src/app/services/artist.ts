import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Artist {

    private baseUrl = "http://localhost:3000/artists";
    private http = inject(HttpClient);

    getArtist(id: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    getOnThisDay(day: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/on-this-day?day=${day}`);
    }

    search(text: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/search?q=${text}`);
    }

    getGenres(id: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}/genres`);
    }

    getDiscography(id: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}/discography`);
    }

    getTopSongs(id: number, page: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}/top-songs?page=${page}`);
    }

    getRecords(id: string) : Observable<any> {
        return this.http.get(`http://localhost:3000/records/artist/${id}`);
    }
}
