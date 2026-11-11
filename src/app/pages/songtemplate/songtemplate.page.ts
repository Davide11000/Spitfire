import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonButton, IonSpinner, IonIcon, IonModal, IonInput, IonTextarea, ToastController } from '@ionic/angular';
import { FooterComponent } from '../../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, musicalNotesOutline, checkmarkCircle, createOutline, lockClosedOutline, heart, heartOutline } from 'ionicons/icons';
import { CommentsComponent } from "../../components/comments/comments.component";
import { Auth } from '../../services/auth';
import { Song } from '../../services/song';
import { Genre } from '../../services/genre';
import { Playlist } from '../../services/playlist';
import { User } from '../../services/user';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AnnotationsComponent } from '../../components/annotations/annotations.component';
import { ContributorsComponent } from '../../components/contributors/contributors.component';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { TranslationMenuComponent } from '../../components/translation-menu/translation-menu.component';
import { getCoverGradient, DEFAULT_HEADER } from '../../utils/cover-color';

@Component({
  selector: 'app-songtemplate',
  templateUrl: './songtemplate.page.html',
  styleUrls: ['./songtemplate.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, IonContent, IonImg, IonButton, IonSpinner, IonModal, IonInput, IonTextarea, FooterComponent, IonIcon, CommentsComponent, NavbarComponent, AnnotationsComponent, ContributorsComponent, TranslationMenuComponent, RatingStarsComponent]
})
export class SongtemplatePage implements OnInit {

  public songId: string | null = null;
  public currentSong: any = null;
  public genres: any[] = [];
  public formattedLyrics: string = '';
  public loadingLyrics: boolean = false;
  public headerBackground: string = DEFAULT_HEADER;

  public isPlaylistModalOpen: boolean = false;
  public userPlaylists: any[] = [];
  public myUsername: string | null = null;
  public isFavourite: boolean = false;
  public annotationToOpen: number | null = null;
  public selectedTranslation: any = null;

  public newPlaylistName: string = '';
  public newPlaylistDescription: string = '';
  public modalError: string = '';
  public creating: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  private song = inject(Song);
  private genre = inject(Genre);
  private playlist = inject(Playlist);
  private user = inject(User);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ addOutline, closeOutline, musicalNotesOutline, checkmarkCircle, createOutline, lockClosedOutline, heart, heartOutline });
  }

  ngOnInit() {
    this.songId = this.route.snapshot.paramMap.get('id');
  }

  ionViewWillEnter() {
    this.myUsername = this.auth.getUsernameFromToken();
    const annotation = this.route.snapshot.queryParamMap.get('annotation');
    this.annotationToOpen = annotation ? Number(annotation) : null;

    if (this.songId) {
      this.loadSong(this.songId);
      this.checkFavourite();
    }
  }

  checkFavourite() {
    this.isFavourite = false;
    if (!this.myUsername || !this.songId) return;

    this.user.getFavouriteSongs(this.myUsername).subscribe({
      next: (res) => { this.isFavourite = res.some((s: any) => s.id === Number(this.songId)); },
      error: (err) => console.error(err)
    });
  }

  toggleFavourite() {
    if (!this.myUsername) {
      this.router.navigate(['/login']);
      return;
    }

    const id = Number(this.songId);
    const request = this.isFavourite ? this.user.removeFavouriteSong(id) : this.user.addFavouriteSong(id);

    request.subscribe({
      next: () => {
        this.isFavourite = !this.isFavourite;
        this.showToast(this.isFavourite ? 'Added to your favourites' : 'Removed from your favourites');
      },
      error: (err) => console.error(err)
    });
  }

  getImage(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getCover(): string {
    if (this.currentSong.image) return this.getImage(this.currentSong.image);
    return this.getImage(this.currentSong.recordimage);
  }

  loadSong(id: string) {
    this.currentSong = null;
    this.selectedTranslation = null;
    this.formattedLyrics = '';
    this.loadingLyrics = true;

    this.song.getSongbyId(parseInt(id)).subscribe({
      next: (res) => {
        this.currentSong = res;
        this.formattedLyrics = this.currentSong.lyrics || 'Lyrics not available for this song.';
        this.loadingLyrics = false;
        this.extractCoverColors();
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/home']);
      }
    });

    this.genre.getSongGenres(parseInt(id)).subscribe({
      next: (res) => { this.genres = res; },
      error: (err) => console.error(err)
    });
  }

  goToCorrectEntry() {
    if (!this.songId) return;
    this.router.navigate(['/add-content'], { queryParams: { correct: 'song', id: this.songId } });
  }

  goToAlbum(recordId: number) {
    if (recordId) {
      this.router.navigate(['/records', recordId]);
    }
  }

  goToArtist(id: number) {
    if (id) {
      this.router.navigate(['/artists', id]);
    }
  }

  async showToast(infoMessage: string) {
    const toast = await this.toastController.create({
      message: infoMessage,
      icon: 'checkmark-circle',
      duration: 2500,
      position: 'bottom',
      cssClass: 'dark-toast'
    });
    await toast.present();
  }

  openPlaylistModal() {
    if (!this.myUsername) {
      this.router.navigate(['/login']);
      return;
    }

    this.newPlaylistName = '';
    this.newPlaylistDescription = '';
    this.modalError = '';

    this.playlist.getUserPlaylists(this.myUsername).subscribe({
      next: (res) => { this.userPlaylists = res; },
      error: (err) => console.error(err)
    });

    this.isPlaylistModalOpen = true;
  }

  closePlaylistModal() {
    this.isPlaylistModalOpen = false;
  }

  onNameInput(event: any) {
    this.newPlaylistName = event.detail.value;
    this.modalError = '';
  }

  onDescriptionInput(event: any) {
    this.newPlaylistDescription = event.detail.value;
  }

  selectPlaylist(pl: any) {
    if (!this.songId) return;
    this.modalError = '';

    this.playlist.addSong(pl.id, parseInt(this.songId)).subscribe({
      next: () => {
        this.isPlaylistModalOpen = false;
        this.showToast('Added to "' + pl.name + '"');
      },
      error: (err) => {
        this.modalError = err.error.message || 'Error adding the song';
      }
    });
  }

  createAndAdd() {
    if (!this.newPlaylistName.trim()) {
      this.modalError = 'Please write a name for the playlist';
      return;
    }

    this.creating = true;
    this.playlist.createPlaylist(this.newPlaylistName.trim(), true, null, this.newPlaylistDescription).subscribe({
      next: (res) => {
        this.creating = false;
        this.selectPlaylist(res);
      },
      error: (err) => {
        this.creating = false;
        this.modalError = err.error.message || 'Error creating the playlist';
      }
    });
  }

  async extractCoverColors() {
    if (!this.currentSong || (!this.currentSong.image && !this.currentSong.recordimage)) return;

    this.headerBackground = await getCoverGradient(this.getCover());
  }
}
