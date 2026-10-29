import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonSearchbar, IonSpinner, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, lockClosedOutline, globeOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { Playlist } from '../../services/playlist';
import { Song } from '../../services/song';
import { Auth } from '../../services/auth';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonSearchbar, IonSpinner, NavbarComponent]
})
export class PlaylistPage implements OnInit {

  public playlist: any = null;
  public songs: any[] = [];
  public isOwner = false;
  public errorMessage = '';
  public actionError = '';

  // Modal per aggiungere le canzoni
  public isAddOpen = false;
  public searchResults: any[] = [];
  public searching = false;

  constructor(private pl : Playlist, private songService : Song, private auth : Auth, private route : ActivatedRoute,
              private router : Router, private alertC : AlertController) {
    addIcons({ addOutline, trashOutline, lockClosedOutline, globeOutline, checkmarkOutline, closeOutline });
  }

  ngOnInit() {
    const playlistID = this.route.snapshot.paramMap.get("playlistId");
    if (!playlistID) return;

    this.pl.getPlaylistById(+playlistID).subscribe({
      next: (res) => {
        this.playlist = res;
        this.isOwner = this.auth.getUsernameFromToken() === res.username;
        this.loadSongs();
      },
      error: (err) => {
        this.errorMessage = err.error.message || "Playlist not found";
      }
    });
  }

  // Se l'immagine non c'è uso quella di default
  getImage(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  // La canzone usa la sua immagine, se non ce l'ha quella dell'album
  getSongImage(song: any): string {
    if (song.image) return this.getImage(song.image);
    return this.getImage(song.recordimage);
  }

  loadSongs() {
    this.pl.getSongs(this.playlist.id).subscribe({
      next: (res) => {this.songs = res;},
      error: (err) => {console.error("Songs not found", err)}
    });
  }

  // Chiede conferma, poi elimina la playlist e torna al profilo
  async onDeletePlaylist() {
    const alert = await this.alertC.create({
      header: 'Delete playlist?',
      message: '"' + this.playlist.name + '" will be deleted. This cannot be undone.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => { this.deletePlaylist(); } }
      ]
    });

    await alert.present();
  }

  deletePlaylist() {
    this.pl.deletePlaylist(this.playlist.id).subscribe({
      next: (res) => { this.router.navigate(['/profile']); },
      error: (err) => { this.actionError = err.error.message || 'Error deleting playlist'; }
    });
  }

  toggleVisibility() {
    const isPublic = !this.playlist.is_public;

    this.pl.setVisibility(this.playlist.id, isPublic).subscribe({
      next: (res) => { this.playlist.is_public = res.is_public; },
      error: (err) => { console.error("Error changing visibility", err); }
    });
  }

  removeSong(song: any) {
    this.pl.removeSong(this.playlist.id, song.id).subscribe({
      next: (res) => { this.songs = this.songs.filter(s => s.id !== song.id); },
      error: (err) => { console.error("Error removing song", err); }
    });
  }

  openAddTracks() {
    this.searchResults = [];
    this.isAddOpen = true;
  }

  onSearch(event: any) {
    const text = event.detail.value;

    if (!text) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.songService.search(text).subscribe({
      next: (res) => {
        this.searchResults = res;
        this.searching = false;
      },
      error: (err) => {
        console.error("Error searching songs", err);
        this.searching = false;
      }
    });
  }

  isInPlaylist(song: any): boolean {
    return this.songs.some(s => s.id === song.id);
  }

  addSong(song: any) {
    this.pl.addSong(this.playlist.id, song.id).subscribe({
      next: (res) => { this.songs.push(song); },
      error: (err) => { console.error("Error adding song", err); }
    });
  }

}
