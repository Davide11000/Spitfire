import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSearchbar, IonSpinner, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, flameOutline, timeOutline, musicalNotesOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { Playlist } from '../../services/playlist';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.page.html',
  styleUrls: ['./lists.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonContent, IonIcon, IonSearchbar, IonSpinner, NgTemplateOutlet, NavbarComponent]
})
export class ListsPage {

  public tab = 'recent';
  public isMenuOpen = false;
  public popular: any[] = [];
  public recent: any[] = [];
  public loading = true;

  public searchText = '';
  public results: any[] = [];
  public searching = false;

  constructor(private pl : Playlist, private router : Router) {
    addIcons({ heart, flameOutline, timeOutline, musicalNotesOutline, chevronDownOutline, chevronUpOutline });
  }

  ionViewWillEnter() {
    this.loadPlaylists();
  }

  loadPlaylists() {
    this.pl.getPopularPlaylists().subscribe({
      next: (res) => {
        this.popular = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading popular playlists', err);
        this.loading = false;
      }
    });

    this.pl.getRecentPlaylists().subscribe({
      next: (res) => { this.recent = res; },
      error: (err) => { console.error('Error loading recent playlists', err); }
    });
  }

  onSearch(event: any) {
    this.searchText = event.detail.value;

    if (!this.searchText) {
      this.results = [];
      return;
    }

    this.searching = true;
    this.pl.searchPlaylists(this.searchText).subscribe({
      next: (res) => {
        this.results = res;
        this.searching = false;
      },
      error: (err) => {
        console.error('Error searching playlists', err);
        this.searching = false;
      }
    });
  }

  selectTab(tab: string) {
    this.tab = tab;
    this.isMenuOpen = false;
    this.clearSearch();
  }

  clearSearch() {
    this.searchText = '';
    this.results = [];
  }

  getCover(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date.replace(' ', 'T') + 'Z').getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' h ago';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + ' d ago';
    return new Date(date.replace(' ', 'T') + 'Z').toLocaleDateString();
  }

  openPlaylist(playlist: any) {
    this.router.navigate(['/playlist', playlist.id]);
  }

  goToProfile(event: any, username: string) {
    event.stopPropagation();
    this.router.navigate(['/profile', username]);
  }

}
