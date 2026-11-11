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
import { Auth } from '../../services/auth';
import { Artist } from '../../services/artist';
import { User } from '../../services/user';

@Component({
  selector: 'app-artisttemplate',
  templateUrl: './artisttemplate.page.html',
  styleUrls: ['./artisttemplate.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, DatePipe, DecimalPipe, NavbarComponent, FooterComponent, ContributorsComponent, CommentsComponent]
})
export class ArtisttemplatePage implements OnInit {

  public artistaId: number | null = null;
  public artista: any = null;
  public utenteLoggatoUid = '';
  public isFavourite = false;

  public generi: any[] = [];
  public discografia: any[] = [];

  public topSongs: any[] = [];
  public totaleCanzoni = 0;
  public paginaCanzoni = 1;
  public caricandoCanzoni = false;

  constructor(private route : ActivatedRoute, private router : Router, private auth : Auth,
              private artistService : Artist, private userService : User) {
    addIcons({ star, createOutline, heartOutline, heart });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.artistaId = id !== null ? Number(id) : null;
      this.caricaTutto();
    });
  }

  // Ionic tiene in memoria la pagina: ricarico i dati ogni volta che si entra
  ionViewWillEnter() {
    this.caricaTutto();
  }

  caricaTutto() {
    if (this.artistaId === null) return;
    const id = this.artistaId;
    this.utenteLoggatoUid = this.auth.getUsernameFromToken() || '';

    this.artistService.getArtist(id).subscribe({
      next: (res) => { this.artista = res; },
      error: () => { this.router.navigate(['/home']); }
    });

    this.artistService.getGenres(id).subscribe({
      next: (res) => { this.generi = res; },
      error: (err) => console.error(err)
    });

    this.artistService.getDiscography(id).subscribe({
      next: (res) => { this.discografia = res; },
      error: (err) => console.error(err)
    });

    this.topSongs = [];
    this.paginaCanzoni = 1;
    this.caricaCanzoni();
    this.controllaSeIsFavourite();
  }

  caricaCanzoni() {
    if (this.artistaId === null) return;

    this.caricandoCanzoni = true;
    this.artistService.getTopSongs(this.artistaId, this.paginaCanzoni).subscribe({
      next: (res) => {
        // Pagina 1: sostituisco (la pagina può caricarsi due volte all'apertura); dopo: aggiungo in fondo
        this.topSongs = res.page === 1 ? res.songs : [...this.topSongs, ...res.songs];
        this.totaleCanzoni = res.total;
        this.caricandoCanzoni = false;
      },
      error: (err) => {
        console.error(err);
        this.caricandoCanzoni = false;
      }
    });
  }

  caricaAltreCanzoni() {
    this.paginaCanzoni++;
    this.caricaCanzoni();
  }

  getImmagine(image: string | null, fallback: string): string {
    if (!image) return fallback;
    return 'http://localhost:3000' + image;
  }

  controllaSeIsFavourite() {
    this.isFavourite = false;
    if (!this.utenteLoggatoUid || this.artistaId === null) return;

    this.userService.getFavouriteArtists(this.utenteLoggatoUid).subscribe({
      next: (res) => { this.isFavourite = res.some((a: any) => a.id === this.artistaId); },
      error: (err) => console.error(err)
    });
  }

  toggleFavourite() {
    if (!this.utenteLoggatoUid) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.artistaId === null) return;

    const richiesta = this.isFavourite ? this.userService.removeFavouriteArtist(this.artistaId) : this.userService.addFavouriteArtist(this.artistaId);
    richiesta.subscribe({
      next: () => { this.isFavourite = !this.isFavourite; },
      error: (err) => console.error(err)
    });
  }

  vaiAllAlbum(id: number) {
    this.router.navigate(['/records', id]);
  }

  vaiAllaCanzone(id: number) {
    this.router.navigate(['/songs', id]);
  }

  vaiACorrectEntry() {
    if (this.artistaId === null) return;
    this.router.navigate(['/add-content'], { queryParams: { correct: 'artist', id: this.artistaId } });
  }
}
