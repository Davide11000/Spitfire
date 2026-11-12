import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, star, heartOutline, heart } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ContributorsComponent } from '../../components/contributors/contributors.component';
import { CommentsComponent } from '../../components/comments/comments.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AboutComponent } from '../../components/about/about.component';
import { Auth } from '../../services/auth';
import { Artist } from '../../services/artist';
import { User } from '../../services/user';

@Component({
  selector: 'app-artisttemplate',
  templateUrl: './artisttemplate.page.html',
  styleUrls: ['./artisttemplate.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, DatePipe, DecimalPipe, NavbarComponent, FooterComponent, ContributorsComponent, CommentsComponent, AboutComponent]
})
export class ArtisttemplatePage implements OnInit {

  public artistId: number | null = null;
  public artist: any = null;
  public myUsername = '';
  public isFavourite = false;

  public genres: any[] = [];
  public discography: any[] = [];

  public topSongs: any[] = [];
  public totalSongs = 0;
  public songsPage = 1;
  public loadingSongs = false;

  constructor(private route : ActivatedRoute, private router : Router, private auth : Auth,
              private artistService : Artist, private userService : User) {
    addIcons({ star, createOutline, heartOutline, heart });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.artistId = id !== null ? Number(id) : null;
      this.loadArtist();
    });
  }

  ionViewWillEnter() {
    this.loadArtist();
  }

  loadArtist() {
    if (this.artistId === null) return;
    const id = this.artistId;
    this.myUsername = this.auth.getUsernameFromToken() || '';

    this.artistService.getArtist(id).subscribe({
      next: (res) => { this.artist = res; },
      error: () => { this.router.navigate(['/home']); }
    });

    this.artistService.getGenres(id).subscribe({
      next: (res) => { this.genres = res; },
      error: (err) => console.error(err)
    });

    this.artistService.getDiscography(id).subscribe({
      next: (res) => { this.discography = res; },
      error: (err) => console.error(err)
    });

    this.topSongs = [];
    this.songsPage = 1;
    this.loadSongs();
    this.checkFavourite();
  }

  loadSongs() {
    if (this.artistId === null) return;

    this.loadingSongs = true;
    this.artistService.getTopSongs(this.artistId, this.songsPage).subscribe({
      next: (res) => {
        this.topSongs = res.page === 1 ? res.songs : [...this.topSongs, ...res.songs];
        this.totalSongs = res.total;
        this.loadingSongs = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingSongs = false;
      }
    });
  }

  loadMoreSongs() {
    this.songsPage++;
    this.loadSongs();
  }

  getImage(image: string | null, fallback: string): string {
    if (!image) return fallback;
    return 'http://localhost:3000' + image;
  }

  checkFavourite() {
    this.isFavourite = false;
    if (!this.myUsername || this.artistId === null) return;

    this.userService.getFavouriteArtists(this.myUsername).subscribe({
      next: (res) => { this.isFavourite = res.some((a: any) => a.id === this.artistId); },
      error: (err) => console.error(err)
    });
  }

  toggleFavourite() {
    if (!this.myUsername) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.artistId === null) return;

    const request = this.isFavourite ? this.userService.removeFavouriteArtist(this.artistId) : this.userService.addFavouriteArtist(this.artistId);
    request.subscribe({
      next: () => {
        this.isFavourite = !this.isFavourite;
        this.artist.followers += this.isFavourite ? 1 : -1;
      },
      error: (err) => console.error(err)
    });
  }

  goToAlbum(id: number) {
    this.router.navigate(['/records', id]);
  }

  goToSong(id: number) {
    this.router.navigate(['/songs', id]);
  }

  goToCorrectEntry() {
    if (this.artistId === null) return;
    this.router.navigate(['/add-content'], { queryParams: { correct: 'artist', id: this.artistId } });
  }
}
