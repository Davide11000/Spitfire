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
        let url = `${this.baseUrl}/discover?genre=${genres[0]}`;
        if (eras.length > 0) {
            url += `&era=${eras[0]}`;
        }
        return this.http.get(url);
    }

    search(text: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/search?q=${text}`);
    }
}
