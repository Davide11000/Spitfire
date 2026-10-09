import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class User {
    private baseUrl = "http://localhost:3000/users";
    private http = inject(HttpClient);

    getUser(id: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    addToFavouriteArtists(id: string) : Observable<any> {
        return this.http.post(`${this.baseUrl}/favourites/artists/`, id);
    }

    removeFromFavouriteArtists(id: string) : Observable<any> {
        return this.http.delete(`${this.baseUrl}/favourites/artists/${id}`);
    }

    addToFavouriteRecords(id: string) : Observable<any> {
        return this.http.post(`${this.baseUrl}/favourites/records/`, id);
    }

    removeFromFavouriteRecords(id: string) : Observable<any> {
        return this.http.delete(`${this.baseUrl}/favourites/records/${id}`);
    }
}
