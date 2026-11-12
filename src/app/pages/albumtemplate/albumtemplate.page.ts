import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonLabel, IonList, IonListHeader, IonItem, IonIcon, IonButton, IonSpinner } from '@ionic/angular';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Auth } from '../../services/auth'
import { User } from '../../services/user';
import { addIcons } from 'ionicons';
import { createOutline, heart, heartOutline } from 'ionicons/icons';
import { CommentsComponent } from "../../components/comments/comments.component";
import { Subscription } from 'rxjs';
import { Record } from '../../services/record';
import { Artist } from '../../services/artist';
import { Song } from '../../services/song';
import { Genre } from '../../services/genre';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ContributorsComponent } from '../../components/contributors/contributors.component';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { AboutComponent } from '../../components/about/about.component';
import { getCoverGradient, DEFAULT_HEADER } from '../../utils/cover-color';

@Component({
  selector: 'app-albumtemplate',
  templateUrl: './albumtemplate.page.html',
  styleUrls: ['./albumtemplate.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonSpinner, 
    IonContent, FooterComponent, CommonModule, NavbarComponent,
    FormsModule, IonLabel, IonList, IonListHeader, IonItem,
    RouterModule, CommentsComponent,
    IonIcon, IonButton, ContributorsComponent, RatingStarsComponent, AboutComponent
]
})
export class AlbumtemplatePage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private user = inject(User);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private record = inject(Record);
  private artist = inject(Artist);
  private song = inject(Song);
  private genre = inject(Genre);

  albumId: string | null = null;
  album: any = null;
  tracklist: any[] = [];
  genres: any[] = [];
  myUsername: string | null = null;
  isFavourite: boolean = false;
  loggedUserId: string | null = null;
  myName: string = 'User';
  isAdmin: boolean = false;
  isModerator: boolean = false;
  public headerBackground: string = DEFAULT_HEADER;

  private adminSub!: Subscription;
  private moderatorSub!: Subscription;

  constructor() {
    addIcons({ createOutline, heart, heartOutline });
  }

  ionViewWillEnter() {
    this.myUsername = this.auth.getUsernameFromToken();

    if (this.albumId) {
      this.loadRecord(this.albumId);
      this.checkFavourite();
    }
  }

  checkFavourite() {
    this.isFavourite = false;
    if (!this.myUsername || !this.albumId) return;

    this.user.getFavouriteRecords(this.myUsername).subscribe({
      next: (res) => { this.isFavourite = res.some((r: any) => r.id === Number(this.albumId)); },
      error: (err) => console.error(err)
    });
  }

  toggleFavourite() {
    if (!this.myUsername) {
      this.router.navigate(['/login']);
      return;
    }

    const id = Number(this.albumId);
    const request = this.isFavourite ? this.user.removeFavouriteRecord(id) : this.user.addFavouriteRecord(id);

    request.subscribe({
      next: () => { this.isFavourite = !this.isFavourite; },
      error: (err) => console.error(err)
    });
  }

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');

    const token = this.auth.getToken();

    if (token) {
      this.auth.getProfile(token).subscribe({
        next: (res) => {
          this.loggedUserId = res.id;
          this.myName = res.displayName || "User";
        },
        error: (err) => console.error(err)
      });

      if (this.loggedUserId) {
        this.user.getUserRole(this.loggedUserId).subscribe({
          next: (res: any) => {
            if (res.ruolo === "admin") {
              this.isAdmin = true;
            }
            else if (res.ruolo === "moderatore") {
              this.isModerator = true;
            }
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error(err)
        });
      }
    }

  }

  ngOnDestroy() {
    document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
    if (this.adminSub) this.adminSub.unsubscribe();
    if (this.moderatorSub) this.moderatorSub.unsubscribe();
  }

  async loadRecord(id: string) {
    this.record.getRecord(id).subscribe({
      next: (res) => {
        this.album = res;
        this.song.getSongsbyRecordID(parseInt(id)).subscribe({
          next: (res) => this.tracklist = res,
          error: (err) => console.error(err)
        });
        this.genre.getRecordGenres(parseInt(id)).subscribe({
          next: (res) => { this.genres = res; },
          error: (err) => console.error(err)
        });
        this.extractCoverColors();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  goToSong(songId: number) {
    if (songId) {
      this.router.navigate(['/songs/', songId]);
    }
  }

  async goToArtist(id: number) {
    this.artist.getArtist(id).subscribe({
      next: (res) => {
        this.router.navigate(['/artists/', res.id]);
      },
      error: (err) => console.error(err)
    });
  }

  goToCorrectEntry() {
    if (!this.albumId) return;
    this.router.navigate(['/add-content'], { queryParams: { correct: 'record', id: this.albumId } });
  }

  getCover(): string {
    if (!this.album || !this.album.image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + this.album.image;
  }

  async extractCoverColors() {
    if (!this.album || !this.album.image) return;

    this.headerBackground = await getCoverGradient(this.getCover());
  }
}