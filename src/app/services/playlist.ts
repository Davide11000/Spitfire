import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Playlist {
  private baseUrl = "http://localhost:3000/playlists";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  createPlaylist(name : string, isPublic : boolean = true): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}`, {name, isPublic}, {
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

  setVisibility(playlistId : number, isPublic : boolean): Observable<any> {
    const token = this.auth.getToken();

    return this.http.patch(`${this.baseUrl}/${playlistId}/visibility`, {isPublic}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getSongs(playlistId : number): Observable<any> {
    // Mando il token così, se sono il proprietario, vedo anche le playlist private
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${playlistId}/songs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getUserPlaylists(username: string): Observable<any> {
    // Mando il token così, se sono il proprietario, vedo anche le playlist private
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/user/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getPlaylistById(playlistId: number): Observable<any> {
    // Mando il token così, se sono il proprietario, vedo anche le playlist private
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}