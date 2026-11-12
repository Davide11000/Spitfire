import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class Playlist {
  private baseUrl = "http://localhost:3000/playlists";

  private http = inject(HttpClient);

  createPlaylist(name : string, isPublic : boolean = true, image : File | null = null, description : string = ''): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('isPublic', String(isPublic));
    formData.append('description', description);

    if (image) {
      formData.append('image', image);
    }

    return this.http.post(`${this.baseUrl}`, formData);
  }

  addSong(playlistId : number, songId : number): Observable<any> {
    return this.http.post(`${this.baseUrl}/songs`, {playlistId, songId});
    
  }

  removeSong(playlistId : number, songId : number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/songs`, {
      body : {playlistId, songId}
    });

  }

  deletePlaylist(playlistId : number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${playlistId}`);
  }

  setVisibility(playlistId : number, isPublic : boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${playlistId}/visibility`, {isPublic});
  }

  getSongs(playlistId : number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${playlistId}/songs`);
  }

  getUserPlaylists(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${username}`);
  }

  getPlaylistById(playlistId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${playlistId}`);
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
    return this.http.post(`${this.baseUrl}/${playlistId}/like`, {});
  }

  unlikePlaylist(playlistId : number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${playlistId}/like`);
  }
}
