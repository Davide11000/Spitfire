import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonToolbar, IonButtons, IonTitle, IonButton, IonSearchbar, IonIcon, IonAvatar, IonList, IonItem, IonLabel, IonListHeader } from '@ionic/angular/standalone';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import { menuOutline, closeOutline } from 'ionicons/icons';
import { Auth } from 'src/app/services/auth';
import { User } from 'src/app/services/user';
import { Song } from 'src/app/services/song';
import { Record } from 'src/app/services/record';
import { Artist } from 'src/app/services/artist';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonToolbar, IonButtons, IonTitle, IonButton, IonSearchbar, IonIcon, IonAvatar, IonList, IonItem, IonLabel, IonListHeader, RouterLink],
})
export class NavbarComponent  implements OnInit {

  public isLoggedIn = false;
  public photo: string | null = null;
  public isMenuOpen = false;

  // Ricerca
  public searchText = '';
  public foundSongs: any[] = [];
  public foundRecords: any[] = [];
  public foundArtists: any[] = [];
  public foundUsers: any[] = [];

  // Posizione della tendina dei risultati: sotto la barra di ricerca e larga come lei
  public resultsLeft = 0;
  public resultsWidth = 0;

  constructor(private auth : Auth, private userService : User, private router : Router,
              private songService : Song, private recordService : Record, private artistService : Artist) {
    addIcons({ menuOutline, closeOutline });
  }

  ngOnInit() {
    this.checkLogin();

    // Ionic tiene in memoria le pagine già aperte, quindi ngOnInit non riparte dopo il login o il logout:
    // ricontrollo a ogni cambio di pagina
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLogin();
        this.isMenuOpen = false;
        this.closeSearch();
      }
    });
  }

  checkLogin() {
    const username = this.auth.getUsernameFromToken();

    if (!username) {
      this.isLoggedIn = false;
      this.photo = null;
      return;
    }

    this.isLoggedIn = true;
    this.userService.getUser(username).subscribe({
      next: (res) => { this.photo = res.foto_profilo; },
      error: (err) => { console.error('Error fetching user', err); }
    });
  }

  // Se l'utente non ha la foto uso quella di default
  getPhoto(): string {
    if (!this.photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + this.photo;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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

  onSearch(event: any, searchBox: HTMLElement) {
    this.searchText = event.detail.value;

    // La barra cambia posto a seconda dello schermo: leggo dove si trova adesso
    const box = searchBox.getBoundingClientRect();
    this.resultsLeft = box.left;
    this.resultsWidth = box.width;

    if (!this.searchText) {
      this.closeSearch();
      return;
    }

    this.isMenuOpen = false;

    this.songService.search(this.searchText).subscribe({
      next: (res) => { this.foundSongs = res; },
      error: (err) => { console.error('Error searching songs', err); }
    });

    this.recordService.search(this.searchText).subscribe({
      next: (res) => { this.foundRecords = res; },
      error: (err) => { console.error('Error searching records', err); }
    });

    this.artistService.search(this.searchText).subscribe({
      next: (res) => { this.foundArtists = res; },
      error: (err) => { console.error('Error searching artists', err); }
    });

    this.userService.search(this.searchText).subscribe({
      next: (res) => { this.foundUsers = res; },
      error: (err) => { console.error('Error searching users', err); }
    });
  }

  closeSearch() {
    this.searchText = '';
    this.foundSongs = [];
    this.foundRecords = [];
    this.foundArtists = [];
    this.foundUsers = [];
  }

  // Foto profilo di un utente trovato nella ricerca
  getUserPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

}
