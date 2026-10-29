import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class User {

    private baseUrl = "http://localhost:3000/users";
    private http = inject(HttpClient);
    private auth = inject(Auth);

    getUser(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}`);
    }

    getUserRole(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/role`);
    }

    search(text: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/search?q=${text}`);
    }

    // La foto viene mandata come form-data nel campo "photo"
    uploadPhoto(file: File) : Observable<any> {
        const token = this.auth.getToken();
        const formData = new FormData();
        formData.append('photo', file);

        return this.http.put(`${this.baseUrl}/me/photo`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    removePhoto() : Observable<any> {
        const token = this.auth.getToken();

        return this.http.delete(`${this.baseUrl}/me/photo`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // PREFERITI

    getFavouriteArtists(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/favourites/artists`);
    }

    addFavouriteArtist(artistId: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}/favourites/artists`, {artistId}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    removeFavouriteArtist(artistId: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.delete(`${this.baseUrl}/favourites/artists`, {
            body: {artistId},
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getFavouriteRecords(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/favourites/records`);
    }

    addFavouriteRecord(recordId: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}/favourites/records`, {recordId}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    removeFavouriteRecord(recordId: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.delete(`${this.baseUrl}/favourites/records`, {
            body: {recordId},
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getFavouriteSongs(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/favourites/songs`);
    }

    addFavouriteSong(songId: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.post(`${this.baseUrl}/favourites/songs`, {songId}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    removeFavouriteSong(songId: number) : Observable<any> {
        const token = this.auth.getToken();

        return this.http.delete(`${this.baseUrl}/favourites/songs`, {
            body: {songId},
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
