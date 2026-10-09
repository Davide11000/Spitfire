import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Playlist {
  private baseUrl = "http://localhost:3000/playlists";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  createPlaylist(playlistName : string, username : string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}`, {name: playlistName}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  addSong(palylistId : number, songId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/songs`, {palylistId, songId}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
  }

  removeSong(palylistId : number, songId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.delete(`${this.baseUrl}/songs`, {
      body : {palylistId, songId},
      headers: { Authorization: `Bearer ${token}` }
    });

  }

  getSongs(palylistId : number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${palylistId}/songs`);
  }

  getUserPlaylists(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${username}`);
  }

  getPlaylistById(playlistId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${playlistId}`);
  }


}