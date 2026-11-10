import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, arrowBackOutline, refreshOutline, star } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Record } from '../../services/record';
import { Genre } from '../../services/genre';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, DecimalPipe, NavbarComponent, FooterComponent]
})
export class DiscoverPage {
  // Passi: 1 generi, 2 epoche, 3 lingue, 4 risultati
  public step = 1;

  public genreList: string[] = [];
  public eraList = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
  public langList: string[] = [];

  public genres: string[] = [];
  public eras: number[] = [];
  public langs: string[] = [];

  public albums: any[] = [];
  public loading = false;
  public error = '';

  constructor(private recordService : Record, private genreService : Genre, private router : Router) {
    addIcons({ arrowForwardOutline, arrowBackOutline, refreshOutline, star });
  }

  ionViewWillEnter() {
    this.genreService.getAllGenres().subscribe({
      next: (res) => { this.genreList = res.map((g: any) => g.name); },
      error: (err) => console.error('Error loading the genres', err)
    });

    this.recordService.getLanguages().subscribe({
      next: (res) => { this.langList = res; },
      error: (err) => console.error('Error loading the languages', err)
    });
  }

  // Aggiunge o toglie un valore dalla lista (scelta multipla)
  toggle(list: any[], value: any) {
    const index = list.indexOf(value);
    if (index === -1) list.push(value);
    else list.splice(index, 1);
    this.error = '';
  }

  next() {
    if (this.step === 1 && this.genres.length === 0) {
      this.error = 'Choose at least one genre';
      return;
    }
    if (this.step === 2 && this.eras.length === 0) {
      this.error = 'Choose at least one era';
      return;
    }

    this.error = '';
    this.step++;
    if (this.step === 4) this.findAlbums();
  }

  back() {
    this.error = '';
    this.step--;
  }

  restart() {
    this.genres = [];
    this.eras = [];
    this.langs = [];
    this.albums = [];
    this.error = '';
    this.step = 1;
  }

  findAlbums() {
    this.loading = true;
    this.recordService.getDiscoverRecords(this.genres, this.eras, this.langs).subscribe({
      next: (res) => {
        this.albums = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Error finding the albums';
        this.loading = false;
      }
    });
  }

  getCover(album: any): string {
    if (!album.image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + album.image;
  }

  goToAlbum(album: any) {
    this.router.navigate(['/records', album.id]);
  }

  goToArtist(event: any, album: any) {
    event.stopPropagation();
    if (album.artist_id !== null) this.router.navigate(['/artists', album.artist_id]);
  }
}
