import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonLabel, IonList, IonListHeader, IonItem, IonIcon, IonButton } from '@ionic/angular';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Auth } from '../../services/auth'
import { User } from '../../services/user';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { CommentsComponent } from "../../components/comments/comments.component";
import { GenresComponent } from "../../components/genres/genres.component";
import { Subscription } from 'rxjs';
import { Record } from '../../services/record';
import { Artist } from '../../services/artist';
import { Song } from '../../services/song';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-albumtemplate',
  templateUrl: './albumtemplate.page.html',
  styleUrls: ['./albumtemplate.page.scss'],
  standalone: true,
  imports: [
    IonContent, FooterComponent, CommonModule, NavbarComponent,
    FormsModule, IonLabel, IonList, IonListHeader, IonItem,
    RouterModule, CommentsComponent,
    IonIcon, IonButton, GenresComponent
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

  albumId: string | null = null;
  album: any = null;
  tracklist: any[] = [];
  utenteLoggatoUid: string | null = null;
  mioNome: string = 'Utente';
  isAdmin: boolean = false;
  isModerator: boolean = false;
  public stileSfondoCard: string = 'rgb(35, 35, 35)';

  private adminSub!: Subscription;
  private moderatorSub!: Subscription;

  constructor() {
    addIcons({ createOutline });
  }

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');

    if (this.albumId) {
      this.caricaDettagliAlbum(this.albumId);
    }

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
    if (!this.album || !this.albumId) return;

    const titoliTracce = Array.isArray(this.album.tracklist)
      ? this.album.tracklist.map((traccia: any) => {
          if (typeof traccia === 'object' && traccia !== null) {
            return traccia.titolo || '';
          }
          return typeof traccia === 'string' ? traccia : '';
        })
      : [];

    const params: any = {
      tipo: 'album',
      fotoBase64: this.album.image || '',
      titolo: this.album.recordname || '',
      artista: this.album.artid || '',
      dataRilascio: this.album.release_date || '',
      lingua: this.album.language || '',
      tracklist: JSON.stringify(titoliTracce)
    };

    this.router.navigate(['/add-content'], { queryParams: params });
  }

  estraiColoriCopertina() {
    if (!this.album || !this.album.fotoBase64) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = this.album.fotoBase64;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D non disponibile');

        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const conteggioColori: { [key: string]: number } = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 200) continue;

          const rArrotondato = Math.round(r / 16) * 16;
          const gArrotondato = Math.round(g / 16) * 16;
          const bArrotondato = Math.round(b / 16) * 16;

          const luma = 0.299 * rArrotondato + 0.587 * gArrotondato + 0.114 * bArrotondato;
          if (luma < 30 || luma > 235) continue;

          const chiaveColore = `${rArrotondato},${gArrotondato},${bArrotondato}`;
          conteggioColori[chiaveColore] = (conteggioColori[chiaveColore] || 0) + 1;
        }

        const coloriOrdinati = Object.keys(conteggioColori).sort((a, b) => conteggioColori[b] - conteggioColori[a]);

        let primoColore = 'rgb(45, 45, 45)';
        let secondoColore = 'rgb(30, 30, 30)';

        if (coloriOrdinati.length > 0) {
          primoColore = `rgb(${coloriOrdinati[0]})`;
        }
        if (coloriOrdinati.length > 1) {
          secondoColore = `rgb(${coloriOrdinati[1]})`;
        } else if (coloriOrdinati.length === 1) {
          const parti = coloriOrdinati[0].split(',');
          secondoColore = `rgb(${Math.floor(Number(parti[0]) * 0.5)}, ${Math.floor(Number(parti[1]) * 0.5)}, ${Math.floor(Number(parti[2]) * 0.5)})`;
        }

        this.stileSfondoCard = `linear-gradient(to bottom, ${primoColore} 0%, ${secondoColore} 100%)`;
        document.documentElement.style.setProperty('--colore-topmenu-dinamico', primoColore);
        this.cdr.detectChanges();

      } catch (error) {
        console.error("Errore Canvas", error);
        this.stileSfondoCard = 'linear-gradient(135deg, rgb(45, 45, 45) 0%, rgb(30, 30, 30) 100%)';
        document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
        this.cdr.detectChanges();
      }
    };

    img.onerror = (err) => {
      console.error("Errore nell'analisi dei colori:", err);
      this.stileSfondoCard = 'linear-gradient(135deg, rgb(45, 45, 45) 0%, rgb(30, 30, 30) 100%)';
      document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
      this.cdr.detectChanges();
    };
  }
}