import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class User {

    private baseUrl = "http://localhost:3000/users";
    private http = inject(HttpClient);

    getUser(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}`);
    }

    getUserRole(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/role`);
    }

    search(text: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/search?q=${text}`);
    }

    uploadPhoto(file: File) : Observable<any> {
        const formData = new FormData();
        formData.append('photo', file);

        return this.http.put(`${this.baseUrl}/me/photo`, formData);
    }

    changeEmail(email: string, password: string) : Observable<any> {
        return this.http.put(`${this.baseUrl}/me/email`, {email, password});
    }

    changePassword(currentPassword: string, newPassword: string) : Observable<any> {
        return this.http.put(`${this.baseUrl}/me/password`, {currentPassword, newPassword});
    }

    updateBio(bio: string) : Observable<any> {
        return this.http.put(`${this.baseUrl}/me/bio`, {bio});
    }

    updateWhoCanMessage(whoCanMessage: string) : Observable<any> {
        return this.http.put(`${this.baseUrl}/me/who-can-message`, {whoCanMessage});
    }

    updateProfileColor(color: string | null) : Observable<any> {
        return this.http.put(`${this.baseUrl}/me/profile-color`, {color});
    }

    deleteAccount(password: string) : Observable<any> {
        return this.http.delete(`${this.baseUrl}/me`, {
            body: {password}
        });
    }

    removePhoto() : Observable<any> {
        return this.http.delete(`${this.baseUrl}/me/photo`);
    }

    getFavouriteArtists(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/favourites/artists`);
    }

    addFavouriteArtist(artistId: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/favourites/artists`, {artistId});
    }

    removeFavouriteArtist(artistId: number) : Observable<any> {
        return this.http.delete(`${this.baseUrl}/favourites/artists`, {
            body: {artistId}
        });
    }

    getFavouriteRecords(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/favourites/records`);
    }

    addFavouriteRecord(recordId: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/favourites/records`, {recordId});
    }

    removeFavouriteRecord(recordId: number) : Observable<any> {
        return this.http.delete(`${this.baseUrl}/favourites/records`, {
            body: {recordId}
        });
    }

    getFavouriteSongs(username: string) : Observable<any> {
        return this.http.get(`${this.baseUrl}/${username}/favourites/songs`);
    }

    addFavouriteSong(songId: number) : Observable<any> {
        return this.http.post(`${this.baseUrl}/favourites/songs`, {songId});
    }

    removeFavouriteSong(songId: number) : Observable<any> {
        return this.http.delete(`${this.baseUrl}/favourites/songs`, {
            body: {songId}
        });
    }
}
