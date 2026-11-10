import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonLabel, IonList, IonListHeader, IonItem, IonIcon, IonButton } from '@ionic/angular';
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
  imports: [
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
  generi: any[] = [];
  mioUsername: string | null = null;
  isPreferito: boolean = false;
  utenteLoggatoUid: string | null = null;
  mioNome: string = 'Utente';
  isAdmin: boolean = false;
  isModerator: boolean = false;
  public stileSfondoCard: string = DEFAULT_HEADER;

  private adminSub!: Subscription;
  private moderatorSub!: Subscription;

  constructor() {
    addIcons({ createOutline, heart, heartOutline });
  }

  ionViewWillEnter() {
    this.mioUsername = this.auth.getUsernameFromToken();

    if (this.albumId) {
      this.caricaDettagliAlbum(this.albumId);
      this.controllaPreferito();
    }
  }

  controllaPreferito() {
    this.isPreferito = false;
    if (!this.mioUsername || !this.albumId) return;

    this.user.getFavouriteRecords(this.mioUsername).subscribe({
      next: (res) => { this.isPreferito = res.some((r: any) => r.id === Number(this.albumId)); },
      error: (err) => console.error(err)
    });
  }

  togglePreferito() {
    if (!this.mioUsername) {
      this.router.navigate(['/login']);
      return;
    }

    const id = Number(this.albumId);
    const richiesta = this.isPreferito ? this.user.removeFavouriteRecord(id) : this.user.addFavouriteRecord(id);

    richiesta.subscribe({
      next: () => { this.isPreferito = !this.isPreferito; },
      error: (err) => console.error(err)
    });
  }

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');

    const token = this.auth.getToken();

    if (token) {
      this.auth.getProfile(token).subscribe({
        next: (res) => {
          this.utenteLoggatoUid = res.id;
          this.mioNome = res.displayName || "Utente";
        },
        error: (err) => console.error(err)
      });

      if (this.utenteLoggatoUid) {
        this.user.getUserRole(this.utenteLoggatoUid).subscribe({
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


    /*this.authService.user$.subscribe(user => {
      if (user) {
        this.utenteLoggatoUid = user.uid;
        this.mioNome = user.displayName || 'Utente';
      } else {
        this.utenteLoggatoUid = null;
      }
      this.cdr.detectChanges();
    });

    this.adminSub = this.authService.isAdmin$.subscribe(v => { this.isAdmin = v; this.cdr.detectChanges(); });
    this.moderatorSub = this.authService.isModerator$.subscribe(v => { this.isModerator = v; this.cdr.detectChanges(); });*/
  }

  ngOnDestroy() {
    document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
    if (this.adminSub) this.adminSub.unsubscribe();
    if (this.moderatorSub) this.moderatorSub.unsubscribe();
  }

  async caricaDettagliAlbum(id: string) {
    this.record.getRecord(id).subscribe({
      next: (res) => {
        this.album = res;
        this.song.getSongsbyRecordID(parseInt(id)).subscribe({
          next: (res) => this.tracklist = res,
          error: (err) => console.error(err)
        });
        this.genre.getRecordGenres(parseInt(id)).subscribe({
          next: (res) => { this.generi = res; },
          error: (err) => console.error(err)
        });
        //this.tracklist = this.album.tracklist || this.album.canzoni || [];
        this.estraiColoriCopertina();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
    /*try {
      const docRef = doc(this.firestore, 'albums', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.album = docSnap.data();
        this.tracklist = this.album.tracklist || this.album.canzoni || [];
        this.estraiColoriCopertina();
        this.cdr.detectChanges();
      } else {
        await this.router.navigate(['/home']);
      }
    } catch (err) {
      console.error("Errore nel recupero dell'album da Firestore:", err);
      await this.router.navigate(['/home']);
    }*/
  }

  vaiAllaCanzone(songId: number) {
    if (songId) {
      this.router.navigate(['/songs/', songId]);
    }
  }

  async vaiAllArtista(id: number) {
    this.artist.getArtist(id).subscribe({
      next: (res) => {
        this.router.navigate(['/artists/', res.id]);
      },
      error: (err) => console.error(err)
    });
    /*if (!nomeArtista) return;
    const nomeInMinuscolo = nomeArtista.toLowerCase().trim();
    const q = query(collection(this.firestore, 'artists'), where('nome_lowercase', '==', nomeInMinuscolo));
    const snap = await getDocs(q);
    if (!snap.empty) {
      this.router.navigate(['/artisttemplate', snap.docs[0].id]);
    }*/
  }

  vaiACorrectEntry() {
    if (!this.albumId) return;
    this.router.navigate(['/add-content'], { queryParams: { correct: 'record', id: this.albumId } });
  }

  getCover(): string {
    if (!this.album || !this.album.image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + this.album.image;
  }

  async estraiColoriCopertina() {
    if (!this.album || !this.album.image) return;

    this.stileSfondoCard = await getCoverGradient(this.getCover());
  }
}