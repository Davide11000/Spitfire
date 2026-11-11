import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Service()
export class Playlist {
  private baseUrl = "http://localhost:3000/playlists";

  private http = inject(HttpClient);
  private auth = inject(Auth);

  createPlaylist(name : string, isPublic : boolean = true, image : File | null = null, description : string = ''): Observable<any> {
    const token = this.auth.getToken();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('isPublic', String(isPublic));
    formData.append('description', description);

    if (image) {
      formData.append('image', image);
    }

    return this.http.post(`${this.baseUrl}`, formData, {
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

  deletePlaylist(playlistId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.delete(`${this.baseUrl}/${playlistId}`, {
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
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${playlistId}/songs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getUserPlaylists(username: string): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/user/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getPlaylistById(playlistId: number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.get(`${this.baseUrl}/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getPopularPlaylists(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/popular`);
  }

  getRecentPlaylists(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/recent`);
  }

  searchPlaylists(text : string): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/search?q=${text}`);
  }

  likePlaylist(playlistId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.post(`${this.baseUrl}/${playlistId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  unlikePlaylist(playlistId : number): Observable<any> {
    const token = this.auth.getToken();

    return this.http.delete(`${this.baseUrl}/${playlistId}/like`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
