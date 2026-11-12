import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonToolbar, IonButtons, IonTitle, IonButton, IonSearchbar, IonIcon, IonAvatar, IonList, IonItem, IonLabel, IonListHeader, IonSpinner } from '@ionic/angular';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import { menuOutline, closeOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { Song } from '../../services/song';
import { Record } from '../../services/record';
import { Artist } from '../../services/artist';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonToolbar, IonButtons, IonTitle, IonButton, IonSearchbar, IonIcon, IonAvatar, IonList, IonItem, IonLabel, IonListHeader, IonSpinner, RouterLink],
})
export class NavbarComponent implements OnInit {

  public isLoggedIn = false;
  public photo: string | null = null;
  public role = '';
  public isMenuOpen = false;

  public searchText = '';
  public foundSongs: any[] = [];
  public foundRecords: any[] = [];
  public foundArtists: any[] = [];
  public foundUsers: any[] = [];
  public searching = 0;

  public resultsLeft = 0;
  public resultsWidth = 0;

  constructor(private auth : Auth, private userService : User, private router : Router,
              private songService : Song, private recordService : Record, private artistService : Artist,
              public notificationService : Notification) {
    addIcons({ menuOutline, closeOutline });
  }

  ngOnInit() {
    this.checkLogin();
    this.notificationService.startPolling();

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
      this.role = '';
      return;
    }

    this.isLoggedIn = true;
    this.notificationService.refreshUnread();
    this.userService.getUser(username).subscribe({
      next: (res) => {
        this.photo = res.foto_profilo;
        this.role = res.ruolo;
      },
      error: (err) => {
        if (err.status === 404) {
          this.auth.logout();
          this.isLoggedIn = false;
          this.photo = null;
          this.role = '';
        }
      }
    });
  }

  getPhoto(): string {
    if (!this.photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + this.photo;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  getImage(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getSongImage(song: any): string {
    if (song.image) return this.getImage(song.image);
    return this.getImage(song.recordimage);
  }

  onSearch(event: any, searchBox: HTMLElement) {
    this.searchText = event.detail.value;

    const box = searchBox.getBoundingClientRect();
    this.resultsLeft = box.left;
    this.resultsWidth = box.width;

    if (!this.searchText) {
      this.closeSearch();
      return;
    }

    this.isMenuOpen = false;
    this.searching = 4;

    this.songService.search(this.searchText).subscribe({
      next: (res) => { this.foundSongs = res.slice(0, 5); this.searching--; },
      error: (err) => { console.error('Error searching songs', err); this.searching--; }
    });

    this.recordService.search(this.searchText).subscribe({
      next: (res) => { this.foundRecords = res.slice(0, 5); this.searching--; },
      error: (err) => { console.error('Error searching records', err); this.searching--; }
    });

    this.artistService.search(this.searchText).subscribe({
      next: (res) => { this.foundArtists = res.slice(0, 5); this.searching--; },
      error: (err) => { console.error('Error searching artists', err); this.searching--; }
    });

    this.userService.search(this.searchText).subscribe({
      next: (res) => { this.foundUsers = res.slice(0, 5); this.searching--; },
      error: (err) => { console.error('Error searching users', err); this.searching--; }
    });
  }

  closeSearch() {
    this.searchText = '';
    this.foundSongs = [];
    this.foundRecords = [];
    this.foundArtists = [];
    this.foundUsers = [];
    this.searching = 0;
  }

  getUserPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

}
