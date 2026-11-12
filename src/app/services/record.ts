import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Service()
export class Record {
    private baseUrl = "http://localhost:3000/records";
    private http = inject(HttpClient);

    getRecord(id: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    getAllRecordsByArtist(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/artist/${id}`);
    }

    getOnThisDay(day: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/on-this-day?day=${day}`);
    }

    getRecentRecords(len: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/recent/${len}`);
    }

    getTopRatedRecords(len: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}/top/${len}`);
    }

    getRecordsByGenres(genres: string[]) : Observable<any> {
        return this.http.get(`${this.baseUrl}/discover?genre=${genres[0]}`);
    }

    getDiscoverRecords(genres: string[], eras: number[], langs: string[]) : Observable<any> {
        const params = `genres=${encodeURIComponent(genres.join(','))}&eras=${eras.join(',')}&langs=${encodeURIComponent(langs.join(','))}`;
        return this.http.get(`${this.baseUrl}/discover?${params}`);
    }

    getLanguages() : Observable<any> {
        return this.http.get(`${this.baseUrl}/languages`);
    }

    search(text: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/search?q=${text}`);
    }
}
