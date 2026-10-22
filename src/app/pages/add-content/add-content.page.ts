import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonList, IonItem, IonButton, IonIcon, IonText, IonModal, IonDatetime } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, sendOutline, imageOutline, addOutline, calendarOutline } from 'ionicons/icons';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { Request } from 'src/app/services/request';
import { Artist } from 'src/app/services/artist';
import { Record } from 'src/app/services/record';

@Component({
  selector: 'app-add-content',
  templateUrl: './add-content.page.html',
  styleUrls: ['./add-content.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonList, IonItem, IonButton, IonIcon, IonText, IonModal, IonDatetime, FormsModule, NavbarComponent]
})
export class AddContentPage implements OnInit {

  public genreList = ['Pop', 'Rock', 'Hip-Hop', 'Rap', 'R&B', 'Soul', 'Funk', 'Jazz', 'Blues', 'Classical',
                      'Electronic', 'Dance', 'Metal', 'Punk', 'Indie', 'Folk', 'Country', 'Reggae', 'Latin', 'Other'];

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
  public genre = '';
  public language = '';
  public lyrics = '';
  public birthDate = '';
  public country = '';
  public bio = '';
  public tracks: string[] = [''];
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

  constructor(private requestService : Request, private artistService : Artist, private recordService : Record) {
    addIcons({ closeOutline, sendOutline, imageOutline, addOutline, calendarOutline });
  }

  ngOnInit() {
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
    this.genre = '';
    this.language = '';
    this.lyrics = '';
    this.birthDate = '';
    this.country = '';
    this.bio = '';
    this.tracks = [''];
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

  // INVIO

  // Controlla che i campi obbligatori del tipo scelto siano compilati
  isFormValid(): boolean {
    if (!this.name || !this.image) return false;

    if (this.type === 'song') {
      return !!this.artistName && !!this.albumName && !!this.releaseDate && !!this.genre && !!this.language;
    }

    if (this.type === 'record') {
      const filledTracks = this.tracks.filter(t => t);
      return !!this.artistName && !!this.releaseDate && !!this.genre && !!this.language && filledTracks.length > 0;
    }

    return !!this.birthDate && !!this.country && !!this.bio;
  }

  onSend() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all the fields';
      return;
    }

    const formData = new FormData();
    formData.append('type', this.type);
    formData.append('name', this.name);

    if (this.image) {
      formData.append('image', this.image);
    }

    if (this.type === 'song') {
      formData.append('artistName', this.artistName);
      formData.append('albumName', this.albumName);
      formData.append('releaseDate', this.releaseDate);
      formData.append('genre', this.genre);
      formData.append('language', this.language);
      formData.append('lyrics', this.lyrics);
    }

    if (this.type === 'record') {
      formData.append('artistName', this.artistName);
      formData.append('releaseDate', this.releaseDate);
      formData.append('genre', this.genre);
      formData.append('language', this.language);
      // Le canzoni vengono salvate una per riga, saltando i campi lasciati vuoti
      formData.append('tracklist', this.tracks.filter(t => t).join('\n'));
    }

    if (this.type === 'artist') {
      formData.append('birthDate', this.birthDate);
      formData.append('country', this.country);
      formData.append('bio', this.bio);
    }

    this.sending = true;
    this.requestService.sendRequest(formData).subscribe({
      next: (res) => {
        this.sending = false;
        this.successMessage = 'Request sent! An admin will review it soon.';
        this.resetForm();
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error.message || 'Error sending the request';
      }
    });
  }

}
