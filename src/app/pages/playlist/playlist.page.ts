import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonList, IonItem, IonAvatar, IonLabel, IonIcon, IonButton, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonSearchbar, AlertController, IonToggle } from '@ionic/angular';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { chatbubbleEllipsesOutline, addOutline, closeOutline, trashOutline, chatbubblesOutline } from 'ionicons/icons';
import { Playlist } from '../../services/playlist';
import { CommentsComponent } from "../../components/comments/comments.component";
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonList, IonItem, IonAvatar, IonLabel, IonIcon, TopmenuComponent, FooterComponent, IonButton, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonSearchbar, CommentsComponent, IonToggle]
})
export class PlaylistPage implements OnInit {

  public playlistId: string | null = null;
  public playlist: any = null;
  
  public canzoniTotali: any[] = []; 
  public canzoniVisualizzate: any[] = []; 
  
  public paginaCorrente: number = 1;
  public elementiPerPagina: number = 5;
  public arrayPagine: number[] = [];

  public isModalCercaAperto: boolean = false;
  public queryRicerca: string = '';
  public tutteLeCanzoneDB: any[] = []; 
  public canzoniFiltrate: any[] = []; 

  public mioUid: string | null = null;
  public mioNome: string = 'Utente';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private playlistdbService = inject(Playlist);
  private authService = inject(Auth);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({ chatbubbleEllipsesOutline, addOutline, closeOutline, trashOutline, chatbubblesOutline });
  }

  ngOnInit() {
    this.playlistId = this.route.snapshot.paramMap.get('id');

    this.authService.user$.subscribe(user => {
      if (user) {
        this.mioUid = user.uid;
        this.mioNome = user.displayName || 'Utente';
      }
    });

    if (this.playlistId) {
      this.caricaDatiPlaylist();
    }
  }

  attivaSceltaFileCopertina(inputElement: HTMLInputElement) {
  if (this.playlist && this.mioUid === this.playlist.creatoreUid) {
    if (inputElement) {
      inputElement.click();
    }
  }
}

  onCopertinaSelezionata(event: any) {
    const file = event.target.files[0];
    if (file && this.playlistId) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        try {
          this.playlist.fotoBase64 = base64String;
          this.cdr.detectChanges();
          
          await this.playlistdbService.aggiornaFotoPlaylist(this.playlistId!, base64String);
          this.cdr.detectChanges();
        } catch (error) {
          console.error("Errore nell'aggiornamento della copertina:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async caricaDatiPlaylist() {
    if (!this.playlistId) return;
    try {
      const docRef = doc(this.firestore, 'playlists', this.playlistId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.playlist = docSnap.data();
        this.canzoniTotali = this.playlist.canzoni || [];
        
        this.calcolaPagine();
        this.aggiornaPagina();
      } else {
        this.router.navigate(['/lists']);
      }
    } catch (error) {
      console.error("Errore nel caricamento della playlist:", error);
    }
  }

  calcolaPagine() {
    const numeroPagine = Math.ceil(this.canzoniTotali.length / this.elementiPerPagina);
    this.arrayPagine = Array.from({ length: numeroPagine }, (_, i) => i + 1);
  }

  aggiornaPagina() {
    const inizio = (this.paginaCorrente - 1) * this.elementiPerPagina;
    const fine = inizio + this.elementiPerPagina;
    this.canzoniVisualizzate = this.canzoniTotali.slice(inizio, fine);
    this.cdr.detectChanges();
  }

  cambiaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.arrayPagine.length) {
      this.paginaCorrente = pagina;
      this.aggiornaPagina();
    }
  }

  async apriModalCerca() {
    this.queryRicerca = '';
    this.isModalCercaAperto = true;
    this.cdr.detectChanges();

    try {
      const songsRef = collection(this.firestore, 'songs');
      const querySnapshot = await getDocs(songsRef);
      
      this.tutteLeCanzoneDB = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.filtraCanzoni();
    } catch (error) {
      console.error("Errore nel caricamento delle canzoni per la modale:", error);
    }
  }

  chiudiModalCerca() {
    this.isModalCercaAperto = false;
    this.cdr.detectChanges();
  }

  filtraCanzoni() {
    const termine = this.queryRicerca.trim().toLowerCase();
    
    if (!termine) {
      this.canzoniFiltrate = [...this.tutteLeCanzoneDB];
    } else {
      this.canzoniFiltrate = this.tutteLeCanzoneDB.filter(canzone => {
        const titolo = canzone.titolo ? canzone.titolo.toLowerCase() : '';
        const artista = canzone.artista ? canzone.artista.toLowerCase() : '';
        return titolo.includes(termine) || artista.includes(termine);
      });
    }
    this.cdr.detectChanges();
  }

  vaiAlProfilo(uid: string) {
    if (uid) {
      this.router.navigate(['/profile', uid]);
    }
  }

  vaiAllaCanzone(idCanzone: string) {
    if (idCanzone) {
      this.router.navigate(['/songtemplate', idCanzone]);
    }
  }

  async aggiungiCanzoneAQuestaPlaylist(canzoneSelezionata: any) {
    const giaPresente = this.canzoniTotali.some(c => c.id === canzoneSelezionata.id);
    if (giaPresente) {
      const alertGiaPresente = await this.alertController.create({
        header: 'Info',
        message: 'This song is already in your playlist.',
        buttons: ['OK']
      });
      await alertGiaPresente.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Add Note',
      message: `Do you want to add a personal comment or note for "${canzoneSelezionata.titolo}"?`,
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Write your thoughts here... (Optional)'
        }
      ],
      buttons: [
        {
          text: 'Skip',
          handler: async () => {
            const tracciaStrutturata = {
              id: canzoneSelezionata.id,
              titolo: canzoneSelezionata.titolo,
              artista: canzoneSelezionata.artista,
              fotoBase64: canzoneSelezionata.fotoBase64 || '',
              notaUtente: ''
            };

            try {
              await this.playlistdbService.aggiungiCanzoneAPlaylist(this.playlistId!, tracciaStrutturata);
              
              this.canzoniTotali.push(tracciaStrutturata);
              this.calcolaPagine();
              this.aggiornaPagina();
              
              this.isModalCercaAperto = false;
              this.cdr.detectChanges();
            } catch (error) {
              console.error("Errore nell'aggiunta della canzone:", error);
            }
          }
        },
        {
          text: 'Add',
          handler: async (data) => {
            const tracciaStrutturata = {
              id: canzoneSelezionata.id,
              titolo: canzoneSelezionata.titolo,
              artista: canzoneSelezionata.artista,
              fotoBase64: canzoneSelezionata.fotoBase64 || '',
              notaUtente: data.nota ? data.nota.trim() : ''
            };

            try {
              await this.playlistdbService.aggiungiCanzoneAPlaylist(this.playlistId!, tracciaStrutturata);
              
              this.canzoniTotali.push(tracciaStrutturata);
              this.calcolaPagine();
              this.aggiornaPagina();
              
              this.isModalCercaAperto = false;
              this.cdr.detectChanges();
            } catch (error) {
              console.error("Errore nell'aggiunta della canzone:", error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async rimuoviCanzone(pezzo: any, event: Event) {
    event.stopPropagation();
    if (!this.playlistId) return;

    try {
      await this.playlistdbService.rimuoviCanzoneDaPlaylist(this.playlistId, pezzo);
      
      this.canzoniTotali = this.canzoniTotali.filter(c => c.id !== pezzo.id);
      
      const maxPagine = Math.ceil(this.canzoniTotali.length / this.elementiPerPagina);
      if (this.paginaCorrente > maxPagine && this.paginaCorrente > 1) {
        this.paginaCorrente = maxPagine;
      }

      this.calcolaPagine();
      this.aggiornaPagina();
    } catch (error) {
      console.error("Errore nella rimozione della canzone:", error);
    }
  }

  async aggiornaPrivacyPlaylist(event: any) {
  if (!this.playlistId) return;
  try {
    await this.playlistdbService.aggiornaPrivacyPlaylist(this.playlistId, event.detail.checked);
  } catch (error) {
    console.error("Errore nell'aggiornamento della privacy:", error);
  }
}
}