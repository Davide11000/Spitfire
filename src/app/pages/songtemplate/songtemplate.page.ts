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
  public canzone: any = null;
  public generi: any[] = [];
  public testoFormattato: string = '';
  public caricamentoTesto: boolean = false;
  public stileSfondoHeader: string = DEFAULT_HEADER;

  public isModalPlaylistAperto: boolean = false;
  public userPlaylists: any[] = [];
  public mioNome: string | null = null;
  public isPreferito: boolean = false;
  public annotazioneDaAprire: number | null = null;
  public traduzioneScelta: any = null;

  public nuovaPlaylistNome: string = '';
  public nuovaPlaylistDescrizione: string = '';
  public erroreModal: string = '';
  public creando: boolean = false;

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
    this.mioNome = this.auth.getUsernameFromToken();
    const annotazione = this.route.snapshot.queryParamMap.get('annotation');
    this.annotazioneDaAprire = annotazione ? Number(annotazione) : null;

    if (this.songId) {
      this.caricaDettagliCanzone(this.songId);
      this.controllaPreferito();
    }
  }

  controllaPreferito() {
    this.isPreferito = false;
    if (!this.mioNome || !this.songId) return;

    this.user.getFavouriteSongs(this.mioNome).subscribe({
      next: (res) => { this.isPreferito = res.some((s: any) => s.id === Number(this.songId)); },
      error: (err) => console.error(err)
    });
  }

  togglePreferito() {
    if (!this.mioNome) {
      this.router.navigate(['/login']);
      return;
    }

    const id = Number(this.songId);
    const richiesta = this.isPreferito ? this.user.removeFavouriteSong(id) : this.user.addFavouriteSong(id);

    richiesta.subscribe({
      next: () => {
        this.isPreferito = !this.isPreferito;
        this.mostraToast(this.isPreferito ? 'Added to your favourites' : 'Removed from your favourites');
      },
      error: (err) => console.error(err)
    });
  }

  getImmagine(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getCopertina(): string {
    if (this.canzone.image) return this.getImmagine(this.canzone.image);
    return this.getImmagine(this.canzone.recordimage);
  }

  caricaDettagliCanzone(id: string) {
    this.canzone = null;
    this.traduzioneScelta = null;
    this.testoFormattato = '';
    this.caricamentoTesto = true;

    this.song.getSongbyId(parseInt(id)).subscribe({
      next: (res) => {
        this.canzone = res;
        this.testoFormattato = this.canzone.lyrics || 'Lyrics not available for this song.';
        this.caricamentoTesto = false;
        this.estraiColoriCopertina();
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/home']);
      }
    });

    this.genre.getSongGenres(parseInt(id)).subscribe({
      next: (res) => { this.generi = res; },
      error: (err) => console.error(err)
    });
  }

  vaiACorrectEntry() {
    if (!this.songId) return;
    this.router.navigate(['/add-content'], { queryParams: { correct: 'song', id: this.songId } });
  }

  vaiAllAlbum(idAlbum: number) {
    if (idAlbum) {
      this.router.navigate(['/records', idAlbum]);
    }
  }

  vaiAllArtista(id: number) {
    if (id) {
      this.router.navigate(['/artists', id]);
    }
  }

  async mostraToast(messaggio: string) {
    const toast = await this.toastController.create({
      message: messaggio,
      icon: 'checkmark-circle',
      duration: 2500,
      position: 'bottom',
      cssClass: 'dark-toast'
    });
    await toast.present();
  }

  apriModalPlaylist() {
    if (!this.mioNome) {
      this.router.navigate(['/login']);
      return;
    }

    this.nuovaPlaylistNome = '';
    this.nuovaPlaylistDescrizione = '';
    this.erroreModal = '';

    this.playlist.getUserPlaylists(this.mioNome).subscribe({
      next: (res) => { this.userPlaylists = res; },
      error: (err) => console.error(err)
    });

    this.isModalPlaylistAperto = true;
  }

  chiudiModalPlaylist() {
    this.isModalPlaylistAperto = false;
  }

  onNomeInput(event: any) {
    this.nuovaPlaylistNome = event.detail.value;
    this.erroreModal = '';
  }

  onDescrizioneInput(event: any) {
    this.nuovaPlaylistDescrizione = event.detail.value;
  }

  selezionaPlaylist(pl: any) {
    if (!this.songId) return;
    this.erroreModal = '';

    this.playlist.addSong(pl.id, parseInt(this.songId)).subscribe({
      next: () => {
        this.isModalPlaylistAperto = false;
        this.mostraToast('Added to "' + pl.name + '"');
      },
      error: (err) => {
        this.erroreModal = err.error.message || 'Error adding the song';
      }
    });
  }

  creaEAggiungi() {
    if (!this.nuovaPlaylistNome.trim()) {
      this.erroreModal = 'Please write a name for the playlist';
      return;
    }

    this.creando = true;
    this.playlist.createPlaylist(this.nuovaPlaylistNome.trim(), true, null, this.nuovaPlaylistDescrizione).subscribe({
      next: (res) => {
        this.creando = false;
        this.selezionaPlaylist(res);
      },
      error: (err) => {
        this.creando = false;
        this.erroreModal = err.error.message || 'Error creating the playlist';
      }
    });
  }

  async estraiColoriCopertina() {
    if (!this.canzone || (!this.canzone.image && !this.canzone.recordimage)) return;

    this.stileSfondoHeader = await getCoverGradient(this.getCopertina());
  }
}
