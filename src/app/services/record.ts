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

    getAllRecordsByArtist(id: string) : Observable<any> {
        return this.http.get(`http://localhost:3000/artist/${id}`);
    }

    getRecentRecords(len: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }

    getTopRatedRecords(len: number) : Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }

    getRecordsByGenres(genres: string[]) {
        return this.http.get(`${this.baseUrl}`);
    }

    getDiscoverRecords(genres: string[], eras: Date[], langs: string[]) {
        return this.http.get(`${this.baseUrl}`);
    }
}
