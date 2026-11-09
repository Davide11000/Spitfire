import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonList, IonItem, IonButton, IonIcon, IonText, IonModal, IonDatetime } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, sendOutline, imageOutline, addOutline, calendarOutline } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Request } from '../../services/request';
import { Artist } from '../../services/artist';
import { Record } from '../../services/record';
import { Genre } from '../../services/genre';
import { Song } from '../../services/song';

@Component({
  selector: 'app-add-content',
  templateUrl: './add-content.page.html',
  styleUrls: ['./add-content.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonList, IonItem, IonButton, IonIcon, IonText, IonModal, IonDatetime, FormsModule, DatePipe, NavbarComponent]
})
export class AddContentPage implements OnInit {

  // I generi arrivano dal server (tabella genres), così l'elenco è uno solo per tutta l'app
  public genreList: any[] = [];

  public languageList = ['English', 'Italian', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean',
                         'Instrumental', 'Other'];

  // Menu di genere e lingua: stessa larghezza del campo e classe per lo stile scuro (in global.scss)
  public selectOptions = { cssClass: 'dark-select', size: 'cover' };

  // Le date si possono scegliere fino a oggi
  public today = new Date().toISOString().substring(0, 10);

  // Cosa sta richiedendo l'utente: 'song', 'record' o 'artist'
  public type = 'song';

  // Campi del modulo (non tutti servono per ogni tipo)
  public name = '';
  public artistName = '';
  public albumName = '';
  public releaseDate = '';
  public genres: string[] = [];
  public language = '';
  public lyrics = '';
  public birthDate = '';
  public country = '';
  public bio = '';
  public tracks: string[] = [''];
  public duration = '';
  public image: File | null = null;
  public imagePreview = '';

  // Finestra per scegliere la data (uscita o nascita)
  public isDateOpen = false;

  // Suggerimenti mentre si scrive artista e album
  public artistSuggestions: any[] = [];
  public albumSuggestions: any[] = [];

  public errorMessage = '';
  public successMessage = '';
  public sending = false;

  public myRequests: any[] = [];

  public correctionId: number | null = null;
  private original: any = null;

  constructor(private requestService : Request, private artistService : Artist, private recordService : Record, private genreService : Genre,
              private songService : Song, private route : ActivatedRoute, private router : Router) {
    addIcons({ closeOutline, sendOutline, imageOutline, addOutline, calendarOutline });
  }

  ngOnInit() {
    this.genreService.getAllGenres().subscribe({
      next: (res) => { this.genreList = res; },
      error: (err) => { console.error('Error loading genres', err); }
    });

    this.route.queryParamMap.subscribe(params => {
      const type = params.get('correct');
      const id = params.get('id');

      if (type && id) {
        this.startCorrection(type, parseInt(id));
      } else if (this.isCorrection()) {
        this.correctionId = null;
        this.original = null;
        this.resetForm();
      }
    });
  }

  ionViewWillEnter() {
    this.loadMyRequests();
  }

  loadMyRequests() {
    this.requestService.getMyRequests().subscribe({
      next: (res) => { this.myRequests = res; },
      error: (err) => { console.error('Error loading requests', err); }
    });
  }

  getRequestImage(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getRequestDate(date: string): Date {
    return new Date(date.replace(' ', 'T') + 'Z');
  }

  getTypeLabel(type: string): string {
    if (type === 'song') return 'Song';
    if (type === 'record') return 'Album';
    if (type === 'translation') return 'Translation';
    return 'Artist';
  }

  getStatusLabel(status: string): string {
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  }

  onTypeChange(event: any) {
    this.type = event.detail.value;
    this.resetForm();
    this.successMessage = '';
  }

  resetForm() {
    this.name = '';
    this.artistName = '';
    this.albumName = '';
    this.releaseDate = '';
    this.genres = [];
    this.language = '';
    this.lyrics = '';
    this.birthDate = '';
    this.country = '';
    this.bio = '';
    this.tracks = [''];
    this.duration = '';
    this.image = null;
    this.imagePreview = '';
    this.artistSuggestions = [];
    this.albumSuggestions = [];
    this.errorMessage = '';
  }

  // Mentre l'utente scrive l'artista, propongo quelli che esistono già
  onArtistInput(event: any) {
    this.artistName = event.detail.value;

    if (!this.artistName) {
      this.artistSuggestions = [];
      return;
    }

    this.artistService.search(this.artistName).subscribe({
      next: (res) => { this.artistSuggestions = res; },
      error: (err) => { console.error('Error searching artists', err); }
    });
  }

  onAlbumInput(event: any) {
    this.albumName = event.detail.value;

    if (!this.albumName) {
      this.albumSuggestions = [];
      return;
    }

    this.recordService.search(this.albumName).subscribe({
      next: (res) => { this.albumSuggestions = res; },
      error: (err) => { console.error('Error searching albums', err); }
    });
  }

  chooseArtist(artist: any) {
    this.artistName = artist.artname;
    this.artistSuggestions = [];
  }

  // Scegliendo un album compilo anche il suo artista
  chooseAlbum(album: any) {
    this.albumName = album.recordname;
    this.artistName = album.artname;
    this.albumSuggestions = [];
    this.artistSuggestions = [];
  }

  // DATA

  // La data scelta: per l'artista è la nascita, per canzoni e album l'uscita
  getDate(): string {
    if (this.type === 'artist') return this.birthDate;
    return this.releaseDate;
  }

  // Mostra la data come GG/MM/AAAA
  formatDate(date: string): string {
    const parts = date.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  onDateChange(event: any) {
    // Il valore arriva come "AAAA-MM-GG" (a volte con l'ora dopo): tengo solo la data
    const date = event.detail.value.substring(0, 10);

    if (this.type === 'artist') this.birthDate = date;
    else this.releaseDate = date;

    this.isDateOpen = false;
  }

  // TRACKLIST

  addTrack() {
    this.tracks.push('');
  }

  removeTrack(index: number) {
    this.tracks.splice(index, 1);
  }

  onTrackInput(index: number, event: any) {
    this.tracks[index] = event.detail.value;
  }

  // IMMAGINE

  onImageSelected(event: any) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'The image must be smaller than 5 MB';
      return;
    }

    this.image = file;
    this.imagePreview = URL.createObjectURL(file); // anteprima nel browser
  }

  removeImage() {
    this.image = null;
    this.imagePreview = '';
  }

  // CORREZIONE

  getImageUrl(image: string | null): string {
    if (!image) return '';
    return 'http://localhost:3000' + image;
  }

  // Uso !== null perché anche 0 è un id valido
  isCorrection(): boolean {
    return this.correctionId !== null;
  }

  startCorrection(type: string, id: number) {
    this.type = type;
    this.correctionId = id;
    this.resetForm();
    this.successMessage = '';
    this.original = { genres: [], tracks: [] };

    if (type === 'song') {
      this.songService.getSongbyId(id).subscribe({
        next: (res) => {
          this.name = res.songname || '';
          this.artistName = res.artname || '';
          this.albumName = res.recordname || '';
          this.language = res.language || '';
          this.lyrics = res.lyrics || '';
          this.duration = res.duration || '';
          this.imagePreview = this.getImageUrl(res.image || res.recordimage);
          this.saveOriginal();
        },
        error: (err) => { this.errorMessage = 'The song to correct was not found'; }
      });

      this.genreService.getSongGenres(id).subscribe({
        next: (res) => {
          this.genres = res.map((g: any) => g.name);
          this.original.genres = [...this.genres];
        },
        error: (err) => { console.error('Error loading genres', err); }
      });
    }

    if (type === 'record') {
      this.recordService.getRecord(String(id)).subscribe({
        next: (res) => {
          this.name = res.recordname || '';
          this.releaseDate = res.release_date ? res.release_date.substring(0, 10) : '';
          this.language = res.language || '';
          this.imagePreview = this.getImageUrl(res.image);
          this.saveOriginal();

          this.artistService.getArtist(res.artid).subscribe({
            next: (artist) => { this.artistName = artist.artname; },
            error: (err) => { console.error('Error loading the artist', err); }
          });
        },
        error: (err) => { this.errorMessage = 'The album to correct was not found'; }
      });

      this.genreService.getRecordGenres(id).subscribe({
        next: (res) => {
          this.genres = res.map((g: any) => g.name);
          this.original.genres = [...this.genres];
        },
        error: (err) => { console.error('Error loading genres', err); }
      });

      this.songService.getSongsbyRecordID(id).subscribe({
        next: (res) => {
          this.original.tracks = res.map((s: any) => s.songname);
          this.tracks = [...this.original.tracks, ''];
        },
        error: (err) => { this.tracks = ['']; }
      });
    }

    if (type === 'artist') {
      this.artistService.getArtist(id).subscribe({
        next: (res) => {
          this.name = res.artname || '';
          this.birthDate = res.birth_date ? res.birth_date.substring(0, 10) : '';
          this.country = res.country || '';
          this.bio = res.bio || '';
          this.imagePreview = this.getImageUrl(res.image);
          this.saveOriginal();
        },
        error: (err) => { this.errorMessage = 'The artist to correct was not found'; }
      });
    }
  }

  saveOriginal() {
    this.original.name = this.name;
    this.original.releaseDate = this.releaseDate;
    this.original.language = this.language;
    this.original.lyrics = this.lyrics;
    this.original.duration = this.duration;
    this.original.birthDate = this.birthDate;
    this.original.country = this.country;
    this.original.bio = this.bio;
  }

  isExistingTrack(index: number): boolean {
    return this.isCorrection() && index < this.original.tracks.length;
  }

  cancelCorrection() {
    this.router.navigate(['/add-content']);
  }

  addChangedFields(formData: FormData): number {
    let changes = 0;

    const fields = [
      ['releaseDate', this.releaseDate], ['language', this.language], ['lyrics', this.lyrics], ['duration', this.duration],
      ['birthDate', this.birthDate], ['country', this.country], ['bio', this.bio]
    ];

    for (const [key, value] of fields) {
      if (value && value.trim() && value.trim() !== (this.original[key] || '').trim()) {
        formData.append(key, value.trim());
        changes++;
      }
    }

    if (this.genres.length > 0 && [...this.genres].sort().join(', ') !== [...this.original.genres].sort().join(', ')) {
      formData.append('genres', this.genres.join(', '));
      changes++;
    }

    const newTracks = this.tracks.filter(t => t.trim() && !this.original.tracks.includes(t.trim()));
    if (this.type === 'record' && newTracks.length > 0) {
      formData.append('tracklist', newTracks.join('\n'));
      changes++;
    }

    if (this.image) {
      formData.append('image', this.image);
      changes++;
    }

    if (this.name.trim() !== this.original.name.trim()) {
      changes++;
    }

    return changes;
  }

  // INVIO

  isFormValid(): boolean {
    if (!this.name.trim()) return false;
    if (this.isCorrection()) return true;

    if (this.type === 'song') return !!this.artistName && !!this.albumName;
    if (this.type === 'record') return !!this.artistName;
    return true;
  }

  isDurationValid(): boolean {
    return !this.duration || /^[0-9]{1,3}:[0-5][0-9]$/.test(this.duration.trim());
  }

  onSend() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isFormValid()) {
      if (this.isCorrection()) this.errorMessage = 'The title is required';
      else if (this.type === 'song') this.errorMessage = 'Title, artist and album are required';
      else if (this.type === 'record') this.errorMessage = 'Title and artist are required';
      else this.errorMessage = 'The name is required';
      return;
    }

    if (!this.isDurationValid()) {
      this.errorMessage = 'The duration must be written as m:ss, e.g. 6:53';
      return;
    }

    const formData = new FormData();
    formData.append('type', this.type);
    formData.append('name', this.name.trim());

    if (this.isCorrection()) {
      formData.append('targetId', String(this.correctionId));

      if (this.addChangedFields(formData) === 0) {
        this.errorMessage = 'Change at least one field';
        return;
      }
    } else {
      this.addNewFields(formData);
    }

    this.sending = true;
    this.requestService.sendRequest(formData).subscribe({
      next: (res) => {
        this.sending = false;
        this.loadMyRequests();

        if (this.isCorrection()) {
          this.router.navigate(['/add-content']);
          this.successMessage = 'Correction sent! An admin will review it soon.';
        } else {
          this.resetForm();
          this.successMessage = 'Request sent! An admin will review it soon.';
        }
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error.message || 'Error sending the request';
      }
    });
  }

  addNewFields(formData: FormData) {
    if (this.image) {
      formData.append('image', this.image);
    }

    if (this.type === 'song') {
      formData.append('artistName', this.artistName);
      formData.append('albumName', this.albumName);
      formData.append('genres', this.genres.join(', '));
      formData.append('language', this.language);
      formData.append('lyrics', this.lyrics);
      formData.append('duration', this.duration.trim());
    }

    if (this.type === 'record') {
      formData.append('artistName', this.artistName);
      formData.append('releaseDate', this.releaseDate);
      formData.append('genres', this.genres.join(', '));
      formData.append('language', this.language);
      formData.append('tracklist', this.tracks.filter(t => t.trim()).join('\n'));
    }

    if (this.type === 'artist') {
      formData.append('birthDate', this.birthDate);
      formData.append('country', this.country);
      formData.append('bio', this.bio);
    }
  }

}
