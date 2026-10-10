import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonImg, IonLabel, IonGrid, IonCol, IonRow, IonList, IonItem, IonButton, IonIcon, IonAvatar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, star, heartOutline, heart } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Auth } from '../../services/auth';
import { Artist } from '../../services/artist';
import { User } from '../../services/user';
import { Record } from '../../services/record';

@Component({
  selector: 'app-artisttemplate',
  templateUrl: './artisttemplate.page.html',
  styleUrls: ['./artisttemplate.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, NavbarComponent, FooterComponent,
    IonGrid, IonCol, IonRow, IonImg, IonIcon, IonLabel,
    IonButton, IonList, IonItem, IonAvatar
]
})
export class ArtisttemplatePage implements OnInit {

  public artistaId: string | null = null;
  public artista: any = null;
  public utenteLoggatoUid: string = '';
  public isFavourite: boolean = false;

  public tuttiGliAlbum: any[] = [];
  public albumMostrati: any[] = [];
  public limiteAlbum: number = 6;

  public canzoniPopolari: any[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor(private auth: Auth, private artistService: Artist, private userService: User, private recordService: Record) {
    addIcons({ star, createOutline, heartOutline, heart });
  }

  ngOnInit() {
    /*this.route.paramMap.subscribe(params => {
      this.artistaId = params.get('id');
      if (this.artistaId) {
        this.caricaDettagliArtista(this.artistaId);
      }
    });*/
    this.artistaId = this.route.snapshot.paramMap.get("artId");

    const token = this.auth.getToken();

    this.recordService.getAllRecordsByArtist(this.artistaId || '').subscribe({
      next: (res) => {this.tuttiGliAlbum = res;},
      error: (err) => {console.error("Records not found", err)}
    });

    if (token) {
      this.auth.getProfile(token).subscribe((value) => {
        if (value) {
          this.utenteLoggatoUid = value.uid;
          if (this.artistaId) {
            this.controllaSeIsFavourite();
          }
        } else {
          this.utenteLoggatoUid = '';
          this.isFavourite = false;
        }
        this.cdr.detectChanges();
      });
    }

    /*this.authService.user$.subscribe(user => {
      if (user) {
        this.utenteLoggatoUid = user.uid;
        if (this.artistaId) {
          this.controllaSeIsFavourite();
        }
      } else {
        this.utenteLoggatoUid = '';
        this.isFavourite = false;
      }
      this.cdr.detectChanges();
    });*/
  }

  async caricaDettagliArtista(id: string) {
    try {
      this.artistService.getArtist(id).subscribe({
        next: (res) => this.artista = res,
        error: (err) => console.error(err)
      });

      if (this.artista) {
        await this.caricaAlbumArtista(this.artista.nome);
        await this.calcolaBraniPopolari(this.artista.nome);
      }

      if (this.utenteLoggatoUid) {
        await this.controllaSeIsFavourite();
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
      alert("Artist not found.");
      this.router.navigate(['/home']);
    }
    /*try {
      const docRef = doc(this.firestore, 'artists', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.artista = docSnap.data();

        if (this.artista && this.artista.nome) {
          await this.caricaAlbumArtista(this.artista.nome);
          await this.calcolaBraniPopolari(this.artista.nome);
        }

        if (this.utenteLoggatoUid) {
          await this.controllaSeIsFavourite();
        }

        this.cdr.detectChanges();
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error(error);
      this.router.navigate(['/home']);
    }*/
  }

  async controllaSeIsFavourite() {
    if (!this.utenteLoggatoUid || !this.artistaId) return;
    try {
      this.userService.getUser(this.utenteLoggatoUid).subscribe((value) => {
        const dati = value;
        const favs: any[] = dati['artistiFavouriti'] || [];
        this.isFavourite = favs.some((a: any) => a.id === this.artistaId);
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error(error);
      alert("Couldn't ascertain if this artist is among user's favourites.");
    }
    /*try {
      const docRef = doc(this.firestore, 'utenti', this.utenteLoggatoUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dati = docSnap.data();
        const favs: any[] = dati['artistiFavouriti'] || [];
        this.isFavourite = favs.some((a: any) => a.id === this.artistaId);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error(error);
    }*/
  }

  async toggleFavourite() {
    if (!this.utenteLoggatoUid || !this.artistaId || !this.artista) return;
    try {
      /*const docRef = doc(this.firestore, 'utenti', this.utenteLoggatoUid);
      const docSnap = await getDoc(docRef);
      let favs: any[] = docSnap.exists() ? (docSnap.data()['artistiFavouriti'] || []) : [];*/

      let favs: any[] = [];
      this.userService.getUser(this.utenteLoggatoUid).subscribe((value) => {
        const dati = value;
        favs = dati['artistiFavouriti'] || [];
      });

      if (this.isFavourite) {
        favs = favs.filter((a: any) => a.id !== this.artistaId);
      } else {
        favs.push({
          id: this.artistaId,
          nome: this.artista.nome,
          fotoBase64: this.artista.fotoBase64 || ''
        });
      }

      if (!this.isFavourite) {
        this.userService.addToFavouriteArtists(this.artistaId).subscribe((_value) => {
          this.isFavourite = true;
        })
      }
      else {
        this.userService.removeFromFavouriteArtists(this.artistaId).subscribe((_value) => {
          this.isFavourite = false;
        })
      }
      /*await updateDoc(docRef, { artistiFavouriti: favs });
      this.isFavourite = !this.isFavourite;*/
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  async caricaAlbumArtista(nomeArtista: string) { //il parametro va cambiato
    try {
      /*const albumsRef = collection(this.firestore, 'albums');
      const nomeInMinuscolo = nomeArtista.toLowerCase().trim();
      const q = query(albumsRef, where('artista_lowercase', '==', nomeInMinuscolo));
      const querySnapshot = await getDocs(q);

      this.tuttiGliAlbum = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));*/

      this.artistService.getRecords(nomeArtista).subscribe((value) => {
        this.tuttiGliAlbum = value;
      });

      this.albumMostrati = this.tuttiGliAlbum.slice(0, this.limiteAlbum);
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  mostraAltriAlbum() {
    this.limiteAlbum += 6;
    this.albumMostrati = this.tuttiGliAlbum.slice(0, this.limiteAlbum);
    this.cdr.detectChanges();
  }

  vaiAllAlbum(idAlbum: string) {
    if (idAlbum) {
      this.router.navigate(['/albumtemplate', idAlbum]);
    }
  }

  vaiAllaCanzone(songId: string) {
    if (songId) {
      this.router.navigate(['/songtemplate', songId]);
    }
  }

  async calcolaBraniPopolari(nomeArtista: string) {
    /*try {
      const songsRef = collection(this.firestore, 'songs');
      const nomeInMinuscolo = nomeArtista.toLowerCase().trim();
      const qSongs = query(songsRef, where('artista_lowercase', '==', nomeInMinuscolo));
      const songsSnapshot = await getDocs(qSongs);

      const elencoCanzoni = songsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        ratingMedia: 0
      }));

      const valutazioniRef = collection(this.firestore, 'valutazioni_canzoni');

      for (let canzone of elencoCanzoni) {
        const qValutazioni = query(valutazioniRef, where('canzoneId', '==', canzone.id));
        const valSnapshot = await getDocs(qValutazioni);

        if (!valSnapshot.empty) {
          let sommaVoti = 0;
          valSnapshot.docs.forEach(docVoto => {
            const datiVoto = docVoto.data();
            sommaVoti += datiVoto['voto'] || 0;
          });
          const media = sommaVoti / valSnapshot.docs.length;
          canzone.ratingMedia = Math.round(media * 10) / 10;
        } else {
          canzone.ratingMedia = 0.0;
        }
      }

      elencoCanzoni.sort((a, b) => b.ratingMedia - a.ratingMedia);
      this.canzoniPopolari = elencoCanzoni.slice(0, 5);
    } catch (error) {
      console.error(error);
    }*/
  }

  vaiACorrectEntry() {
    if (!this.artista || !this.artistaId) return;
    const albumFattiString = this.artista.albumFatti
      ? JSON.stringify(this.artista.albumFatti)
      : '[]';

    const params: any = {
      tipo: 'artist',
      idDoc: this.artistaId,
      nome: this.artista.nome || '',
      fotoBase64: this.artista.fotoBase64 || '',
      generi: this.artista.generi || '',
      dataNascita: this.artista.dataNascita || '',
      albumFatti: albumFattiString
    };

    this.router.navigate(['/add-content'], { queryParams: params });
  }
}