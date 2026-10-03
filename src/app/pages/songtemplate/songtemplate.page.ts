import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonButton, IonSpinner, IonIcon, ToastController } from '@ionic/angular';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RatingStarsComponent } from "../../components/rating-stars/rating-stars.component";
import { AnnotationsComponent } from '../../components/annotations/annotations.component';
import { PlaylistdbService } from '../services/playlistdb';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, musicalNotesOutline, createOutline, languageOutline, sendOutline, pencilOutline } from 'ionicons/icons';
import { CommentsComponent } from "../../components/comments/comments.component";
import { Subscription } from 'rxjs';
import { GenresComponent } from '../../components/genres/genres.component';

@Component({
  selector: 'app-songtemplate',
  templateUrl: './songtemplate.page.html',
  styleUrls: ['./songtemplate.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonImg, IonButton, IonSpinner, TopmenuComponent, FooterComponent, RatingStarsComponent, IonIcon, CommentsComponent, AnnotationsComponent, GenresComponent]
})
export class SongtemplatePage implements OnInit, OnDestroy {

  public songId: string | null = null;
  public canzone: any = null;
  public testoFormattato: string = '';
  public testoMostrato: string = '';
  public caricamentoTesto: boolean = false;
  public stileSfondoHeader: string = 'rgb(35, 35, 35)';

  public vistaAttiva: 'lyrics' | 'analysis' | 'translation' = 'lyrics';

  public isModalPlaylistAperto: boolean = false;
  public userPlaylists: any[] = [];
  public mioUid: string | null = null;
  public mioNome: string = 'Utente';
  public isAdmin: boolean = false;
  public isModerator: boolean = false;
  public isMobile: boolean = false;

  public nuovaPlaylistNome: string = '';
  public nuovaPlaylistDescrizione: string = '';

  public traduzioniDisponibili: any[] = [];
  public linguaSelezionata: string = 'original';

  public isModalTraduzioneAperto: boolean = false;
  public nuovaTraduzioneLingua: string = '';
  public nuovaTraduzioneTestoInput: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(Auth);
  private playlistdbService = inject(PlaylistdbService);
  private toastController = inject(ToastController);
  private adminSub!: Subscription;
  private moderatorSub!: Subscription;

  constructor() {
    addIcons({ pencilOutline, addOutline, closeOutline, musicalNotesOutline, createOutline, languageOutline, sendOutline });
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;

    this.authService.user$.subscribe(user => {
      if (user) {
        this.mioUid = user.uid;
        this.mioNome = user.displayName || 'Utente';
      } else {
        this.mioUid = null;
      }
    });

    this.adminSub = this.authService.isAdmin$.subscribe(v => { this.isAdmin = v; this.cdr.detectChanges(); });
    this.moderatorSub = this.authService.isModerator$.subscribe(v => { this.isModerator = v; this.cdr.detectChanges(); });

    this.route.paramMap.subscribe(params => {
      this.songId = params.get('id');
      if (this.songId) {
        this.caricaDettagliCanzone(this.songId);
      }
    });
  }

  ngOnDestroy() {
    document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
    if (this.adminSub) this.adminSub.unsubscribe();
    if (this.moderatorSub) this.moderatorSub.unsubscribe();
  }

  cambiaVista(vista: 'lyrics' | 'analysis' | 'translation') {
    this.vistaAttiva = vista;
    this.cdr.detectChanges();
  }

  caricaDettagliCanzone(id: string) {
    this.canzone = null;
    this.testoFormattato = '';
    this.testoMostrato = '';
    this.caricamentoTesto = true;
    this.traduzioniDisponibili = [];
    this.linguaSelezionata = 'original';
    this.cdr.detectChanges();
    
    const docRef = doc(this.firestore, 'songs', id);
    
    getDoc(docRef).then(async docSnap => {
      if (docSnap.exists()) {
        this.canzone = docSnap.data();
        this.estraiColoriCopertina();
        
        if (this.canzone && this.canzone.testo) {
          this.testoFormattato = this.canzone.testo.replace(/\n/g, '<br>');
        } else {
          this.testoFormattato = "Testo non inserito per questo brano.";
        }
        this.testoMostrato = this.testoFormattato;
        this.caricaTraduzioni(id);
      } else {
        this.router.navigate(['/home']);
      }
      this.caricamentoTesto = false;
      this.cdr.detectChanges();
    }).catch(err => {
      console.error("Errore nel recupero della canzone da Firestore:", err);
      this.testoFormattato = "Errore nel caricamento del testo.";
      this.testoMostrato = this.testoFormattato;
      this.caricamentoTesto = false;
      this.cdr.detectChanges();
    });
  }

  async caricaTraduzioni(songId: string) {
    try {
      const translationsRef = collection(this.firestore, 'songs', songId, 'translations');
      const snap = await getDocs(translationsRef);
      this.traduzioniDisponibili = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.cdr.detectChanges();
    } catch (err) {
      console.error("Errore nel recupero delle traduzioni:", err);
    }
  }

  cambiaLingua(valore: string) {
    if (valore === 'original') {
      this.testoMostrato = this.testoFormattato;
    } else {
      const traduzione = this.traduzioniDisponibili.find(t => t.id === valore);
      if (traduzione && traduzione.testo) {
        this.testoMostrato = traduzione.testo.replace(/\n/g, '<br>');
      }
    }
    this.cdr.detectChanges();
  }

  vaiACorrectEntry() {
    if (!this.canzone || !this.songId) return;
    const params: any = {
      tipo: 'song',
      fotoBase64: this.canzone.fotoBase64 || '',
      titolo: this.canzone.titolo || '',
      artista: this.canzone.artista || '',
      album: this.canzone.album || '',
      generi: this.canzone.generi || '',
      lingua: this.canzone.lingua || '',
      testo: this.canzone.testo || '',
      note: this.canzone.note || ''
    };
    this.router.navigate(['/add-content'], { queryParams: params });
  }

  apriModalTraduzione() {
    console.log('=== APRI MODAL TRADUZIONE ===');
    console.log('isModalTraduzioneAperto prima:', this.isModalTraduzioneAperto);
    this.isModalTraduzioneAperto = true;
    console.log('isModalTraduzioneAperto dopo:', this.isModalTraduzioneAperto);
    this.cdr.detectChanges();
  }

  chiudiModalTraduzione() {
    this.isModalTraduzioneAperto = false;
    this.nuovaTraduzioneLingua = '';
    this.nuovaTraduzioneTestoInput = '';
  }

  async inviaTraduzione() {
    if (!this.nuovaTraduzioneLingua.trim() || !this.nuovaTraduzioneTestoInput.trim() || !this.mioUid || !this.songId) return;

    const richiestaDoc = {
      uidUtente: this.mioUid,
      displayNameUtente: this.mioNome,
      tipo: 'translation',
      stato: 'in_attesa',
      dataCreazione: new Date(),
      dati: {
        songId: this.songId,
        titoloCanzone: this.canzone?.titolo || '',
        artistaCanzone: this.canzone?.artista || '',
        lingua: this.nuovaTraduzioneLingua.trim(),
        testo: this.nuovaTraduzioneTestoInput.trim()
      }
    };

    try {
      await addDoc(collection(this.firestore, 'requests'), richiestaDoc);
      const toast = await this.toastController.create({ message: 'Translation submitted successfully!', duration: 3000, position: 'bottom', color: 'dark' });
      await toast.present();
      this.chiudiModalTraduzione();
    } catch (error) {
      console.error(error);
      const toast = await this.toastController.create({ message: 'Error submitting translation. Try again.', duration: 3000, position: 'bottom', color: 'dark' });
      await toast.present();
    }
  }

  vaiAllAlbum(idAlbum: string) {
    if (idAlbum) {
      this.router.navigate(['/albumtemplate', idAlbum]);
    }
  }

  async vaiAllArtista(nomeArtista: string) {
    if (!nomeArtista) return;
    const nomeInMinuscolo = nomeArtista.toLowerCase().trim();
    const q = query(collection(this.firestore, 'artists'), where('nome_lowercase', '==', nomeInMinuscolo));
    const snap = await getDocs(q);
    if (!snap.empty) {
      this.router.navigate(['/artisttemplate', snap.docs[0].id]);
    }
  }

  async apriModalPlaylist() {
    console.log('=== APRI MODAL PLAYLIST ===');
     console.log('mioUid:', this.mioUid);
    if (!this.mioUid) return;
    try {
      const q = query(collection(this.firestore, 'playlists'), where('creatoreUid', '==', this.mioUid));
      const querySnapshot = await getDocs(q);
      this.userPlaylists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(error);
    }
    this.isModalPlaylistAperto = true;
    this.cdr.detectChanges();
    console.log('isModalPlaylistAperto:', this.isModalPlaylistAperto);
  }

  chiudiModalPlaylist() {
    this.isModalPlaylistAperto = false;
    this.nuovaPlaylistNome = '';
    this.nuovaPlaylistDescrizione = '';
  }

  async selezionaPlaylist(playlistId: string) {
    if (!this.songId || !this.canzone) return;
    const tracciaStrutturata = {
      id: this.songId,
      titolo: this.canzone.titolo,
      artista: this.canzone.artista,
      fotoBase64: this.canzone.fotoBase64 || '',
      notaUtente: ''
    };
    try {
      await this.playlistdbService.aggiungiCanzoneAPlaylist(playlistId, tracciaStrutturata);
      this.chiudiModalPlaylist();
    } catch (error) {
      console.error(error);
    }
  }

  async rapidaCreaPlaylist() {
    if (!this.nuovaPlaylistNome.trim() || !this.mioUid) return;
    try {
      const nuovaPlaylistId = await this.playlistdbService.creaPlaylist(
        this.mioUid, this.mioNome,
        this.nuovaPlaylistNome.trim(),
        this.nuovaPlaylistDescrizione.trim(), ''
      );
      const nuovaPlLocale = { id: nuovaPlaylistId, nome: this.nuovaPlaylistNome.trim(), fotoBase64: '', canzoni: [] };
      this.userPlaylists = [nuovaPlLocale, ...this.userPlaylists];
      this.nuovaPlaylistNome = '';
      this.nuovaPlaylistDescrizione = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  estraiColoriCopertina() {
    if (!this.canzone || !this.canzone.fotoBase64) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = this.canzone.fotoBase64;

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

        if (coloriOrdinati.length > 0) primoColore = `rgb(${coloriOrdinati[0]})`;
        if (coloriOrdinati.length > 1) {
          secondoColore = `rgb(${coloriOrdinati[1]})`;
        } else if (coloriOrdinati.length === 1) {
          const parti = coloriOrdinati[0].split(',');
          secondoColore = `rgb(${Math.floor(Number(parti[0]) * 0.5)}, ${Math.floor(Number(parti[1]) * 0.5)}, ${Math.floor(Number(parti[2]) * 0.5)})`;
        }

        this.stileSfondoHeader = `linear-gradient(to bottom, ${primoColore} 0%, ${secondoColore} 100%)`;
        document.documentElement.style.setProperty('--colore-topmenu-dinamico', primoColore);
        this.cdr.detectChanges();

      } catch (error) {
        console.error("Errore Canvas", error);
        this.stileSfondoHeader = 'linear-gradient(135deg, rgb(45, 45, 45) 0%, rgb(30, 30, 30) 100%)';
        document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
        this.cdr.detectChanges();
      }
    };

    img.onerror = (err) => {
      console.error("Errore nell'analisi dei colori:", err);
      this.stileSfondoHeader = 'linear-gradient(135deg, rgb(45, 45, 45) 0%, rgb(30, 30, 30) 100%)';
      document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
      this.cdr.detectChanges();
    };
  }
}