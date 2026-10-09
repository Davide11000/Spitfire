import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Service()
export class Record {
    private baseUrl = "http://localhost:3000/records";
    private http = inject(HttpClient);

    getRecord(id: string) {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    getAllRecordsByArtist(id: string) {
        return this.http.get(`http://localhost:3000/artist/${id}`);
    }
}
