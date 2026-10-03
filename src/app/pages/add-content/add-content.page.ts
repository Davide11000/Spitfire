import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonCard, IonCardTitle, IonSegment, IonSegmentButton, 
  IonIcon, IonLabel, IonItem, IonInput, IonTextarea, IonButton, ToastController 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  personOutline, discOutline, musicalNotesOutline, 
  cloudUploadOutline, addOutline, trashOutline 
} from 'ionicons/icons';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { Auth } from '../../services/auth'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-content',
  templateUrl: './add-content.page.html',
  styleUrls: ['./add-content.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TopmenuComponent, IonContent, IonCard, 
    IonCardTitle, IonSegment, IonSegmentButton, IonIcon, IonLabel, 
    IonItem, IonInput, IonTextarea, IonButton
  ]
})
export class AddContentPage implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  public tipoSelezionato: 'artist' | 'album' | 'song' = 'artist';
  public fotoAnteprima: string = '';
  
  private mioUid: string = '';
  private mioNome: string = '';
  private authSub!: Subscription;

  public formArtista = { nome: '', dataNascita: '', albumFatti: [] as string[] };
  public formAlbum = { titolo: '', artista: '', dataRilascio: '', lingua:'', tracklist: [] as string[] };
  public formCanzone = { titolo: '', artista: '', album: '', lingua: '', testo: '', note: '' };

  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ personOutline, discOutline, musicalNotesOutline, cloudUploadOutline, addOutline, trashOutline });
  }

  ngOnInit() {
    this.authSub = this.authService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.mioUid = user.uid;
        this.mioNome = user.displayName || 'Contributor';
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['fotoBase64']) {
        this.fotoAnteprima = params['fotoBase64'];
      }

      if (params['tipo'] === 'song') {
        this.tipoSelezionato = 'song';
        this.formCanzone.titolo = params['titolo'] || '';
        this.formCanzone.artista = params['artista'] || '';
        this.formCanzone.album = params['album'] || '';
        this.formCanzone.lingua = params['lingua'] || '';
        this.formCanzone.testo = params['testo'] || '';
        this.formCanzone.note = params['note'] || '';
        this.cdr.detectChanges();
      }
      else if (params['tipo'] === 'album') {
        this.tipoSelezionato = 'album';
        this.formAlbum.titolo = params['titolo'] || '';
        this.formAlbum.artista = params['artista'] || '';
        this.formAlbum.dataRilascio = params['dataRilascio'] || '';
        this.formAlbum.lingua = params['lingua'] || '';
        
        if (params['tracklist']) {
          try {
            this.formAlbum.tracklist = JSON.parse(params['tracklist']);
          } catch (e) {
            this.formAlbum.tracklist = []; 
          }
        }
        this.cdr.detectChanges();
      }
      else if (params['tipo'] === 'artist') {
        this.tipoSelezionato = 'artist';
        this.formArtista.nome = params['nome'] || '';
        this.formArtista.dataNascita = params['dataNascita'] || '';

        if (params['albumFatti']) {
          if (Array.isArray(params['albumFatti'])) {
            this.formArtista.albumFatti = [...params['albumFatti']];
          } else if (typeof params['albumFatti'] === 'string') {
            try {
              this.formArtista.albumFatti = JSON.parse(params['albumFatti']);
            } catch (e) {
              this.formArtista.albumFatti = params['albumFatti'].split(',').map((x: string) => x.trim()).filter((x: string) => x.length > 0);
            }
          }
        }
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  cambiaTipo(event: any) {
    this.tipoSelezionato = event.detail.value;
    this.fotoAnteprima = '';
    this.cdr.detectChanges();
  }

  triggerFileInput() {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelezionato(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoAnteprima = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  aggiungiAlbumArtista() {
    this.formArtista.albumFatti.push('');
    this.cdr.detectChanges();
  }

  rimuoviAlbumArtista(index: number) {
    this.formArtista.albumFatti.splice(index, 1);
    this.cdr.detectChanges();
  }

  aggiungiTraccia() {
    this.formAlbum.tracklist.push('');
    this.cdr.detectChanges();
  }

  rimuoviTraccia(index: number) {
    this.formAlbum.tracklist.splice(index, 1);
    this.cdr.detectChanges();
  }

  async inviaRichiesta() {
    if (!this.mioUid) {
      await this.mostraToast('You must be logged in to submit content.');
      return;
    }

    let payloadDati: any = {};

    if (this.tipoSelezionato === 'artist') {
      payloadDati = { 
        nome: this.formArtista.nome.trim(),
        dataNascita: this.formArtista.dataNascita,
        albumFatti: this.formArtista.albumFatti || [],
        fotoBase64: this.fotoAnteprima 
      };
    } else if (this.tipoSelezionato === 'album') {
      payloadDati = { 
        titolo: this.formAlbum.titolo.trim(),
        artista: this.formAlbum.artista.trim(),
        dataRilascio: this.formAlbum.dataRilascio,
        lingua: this.formAlbum.lingua.trim(),
        tracklist: this.formAlbum.tracklist || [],
        fotoBase64: this.fotoAnteprima 
      };
    } else if (this.tipoSelezionato === 'song') {
    payloadDati = {
    titolo: this.formCanzone.titolo.trim(),
    artista: this.formCanzone.artista.trim(),
    album: this.formCanzone.album.trim(),
    lingua: this.formCanzone.lingua.trim(),
    testo: this.formCanzone.testo ? this.formCanzone.testo.trim() : '',
    note: this.formCanzone.note ? this.formCanzone.note.trim() : '',
    fotoBase64: this.fotoAnteprima
  };
}

    const richiestaDoc = {
      uidUtente: this.mioUid,
      displayNameUtente: this.mioNome,
      tipo: this.tipoSelezionato,
      stato: 'in_attesa',
      dataCreazione: new Date(),
      dati: payloadDati
    };

    try {
      await addDoc(collection(this.firestore, 'requests'), richiestaDoc);
      await this.mostraToast('Request submitted successfully!');
      this.resetForm();
    } catch (e) {
      await this.mostraToast('Error submitting request. Try again.');
    }
  }

  private async mostraToast(messaggio: string) {
    const toast = await this.toastController.create({
      message: messaggio,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  private resetForm() {
    this.formArtista = { nome: '', dataNascita: '', albumFatti: [] };
    this.formAlbum = { titolo: '', artista: '', dataRilascio: '', lingua:'', tracklist: [] };
    this.formCanzone = { titolo: '', artista: '', album: '', lingua: '', testo: '', note: '' };
    this.fotoAnteprima = '';
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }
}