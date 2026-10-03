import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Playlist {
  private baseUrl = "http://localhost:3000/playlists";

  constructor(private http: HttpClient, private auth: Auth) {}

  createPlaylist(playlistName : string, username : string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}`, {name: playlistName}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  addSong(playlistId : number, songId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/songs`, {playlistId, songId}, {
      headers: { Authorization: `Bearer ${token}` }
    });

  }

  removeSong(playlistId : number, songId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.delete(`${this.baseUrl}/songs`, {
      body : {playlistId, songId},
      headers: { Authorization: `Bearer ${token}` }
    });

  }

  getSongs(playlistId : number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${playlistId}/songs`);
  }

  getUserPlaylists(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${username}`);
  }


}