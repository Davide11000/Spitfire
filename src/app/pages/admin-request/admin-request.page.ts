import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonCard, IonItem, IonLabel, IonCardContent, IonButton, IonIcon, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkDoneCircleOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { Auth } from '../../services/auth'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-request.page.html',
  styleUrls: ['./admin-request.page.scss'],
  standalone: true,
  imports: [CommonModule, TopmenuComponent, IonContent, IonCard, IonItem, IonLabel, IonCardContent, IonButton, IonIcon]
})
export class AdminRequestPage implements OnInit, OnDestroy {

  public richieste: any[] = [];
  private authSub!: Subscription;
  private dataSub!: Subscription;

  private authService = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ checkmarkDoneCircleOutline, checkmarkOutline, closeOutline });
  }

  ngOnInit() {
    this.authSub = this.authService.isAdmin$.subscribe(isAdmin => {
      if (!isAdmin) {
        this.router.navigate(['/home']);
      } else {
        this.caricaRichieste();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  caricaRichieste() {
    const colRef = collection(this.firestore, 'requests');
    this.dataSub = collectionData(colRef, { idField: 'id' }).subscribe(data => {
      this.richieste = data.sort((a: any, b: any) => {
        const dateA = a.dataCreazione?.seconds || 0;
        const dateB = b.dataCreazione?.seconds || 0;
        return dateB - dateA;
      });
      this.cdr.detectChanges();
    });
  }

  async approvaRichiesta(richiesta: any) {
    if (richiesta.tipo === 'translation') {
      await this.approvaTraduzioneRichiesta(richiesta);
      return;
    }

    let destinazioneCollezione = '';
    
    if (richiesta.tipo === 'artist') destinazioneCollezione = 'artists';
    else if (richiesta.tipo === 'album') destinazioneCollezione = 'albums';
    else if (richiesta.tipo === 'song') destinazioneCollezione = 'songs';

    try {
      if (richiesta.tipo === 'album') {
        const tracceGrezze = richiesta.dati.tracklist || [];
        const tracklistMappata: any[] = [];

        for (const titoloTraccia of tracceGrezze) {
          const songsRef = collection(this.firestore, 'songs');
          const q = query(songsRef, where('titolo', '==', titoloTraccia.trim()));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            tracklistMappata.push({
              id: querySnapshot.docs[0].id,
              titolo: titoloTraccia.trim()
            });
          } else {
            tracklistMappata.push({
              id: '',
              titolo: titoloTraccia.trim()
            });
          }
        }
        richiesta.dati.tracklist = tracklistMappata;
        richiesta.dati.titolo_lowercase = richiesta.dati.titolo.toLowerCase().trim();

        if (richiesta.dati.artista) {
          richiesta.dati.artista_lowercase = richiesta.dati.artista.toLowerCase().trim();
        }
      }

      if (richiesta.tipo === 'song') {
        richiesta.dati.titolo_lowercase = richiesta.dati.titolo.toLowerCase().trim();
        
        richiesta.dati.rating = 0;

        if (richiesta.dati.artista) {
          richiesta.dati.artista_lowercase = richiesta.dati.artista.toLowerCase().trim();
        }
        
        if (richiesta.dati.album) {
          const albumsRef = collection(this.firestore, 'albums');
          const q = query(albumsRef, where('titolo', '==', richiesta.dati.album.trim()));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            richiesta.dati.albumId = querySnapshot.docs[0].id;
          } else {
            richiesta.dati.albumId = '';
          }
        }
      }
      if (richiesta.tipo === 'artist') {
        richiesta.dati.nome_lowercase = richiesta.dati.nome.toLowerCase().trim();
      }

      const nuovoDocRef = await addDoc(collection(this.firestore, destinazioneCollezione), richiesta.dati);
      const nuovoIdGenerato = nuovoDocRef.id;

      if (richiesta.tipo === 'song' && richiesta.dati.albumId) {
        const albumDocRef = doc(this.firestore, 'albums', richiesta.dati.albumId);
        const albumSnap = await getDoc(albumDocRef);
        
        if (albumSnap.exists()) {
          const datiAlbum = albumSnap.data();
          const tracklistAttuale = datiAlbum['tracklist'] || [];
          
          const index = tracklistAttuale.findIndex((t: any) => t.titolo.trim().toLowerCase() === richiesta.dati.titolo.trim().toLowerCase());
          if (index !== -1) {
            tracklistAttuale[index].id = nuovoIdGenerato;
            await updateDoc(albumDocRef, { tracklist: tracklistAttuale });
          }
        }
      }

      if (richiesta.tipo === 'album') {
        const songsRef = collection(this.firestore, 'songs');
        const q = query(songsRef, where('album', '==', richiesta.dati.titolo.trim()));
        const querySnapshot = await getDocs(q);
        
        const tracklistAttuale = richiesta.dati.tracklist || [];

        for (const canzoneDoc of querySnapshot.docs) {
          const canzoneDocRef = doc(this.firestore, 'songs', canzoneDoc.id);
          await updateDoc(canzoneDocRef, { albumId: nuovoIdGenerato });
          
          const index = tracklistAttuale.findIndex((t: any) => t.titolo.trim().toLowerCase() === canzoneDoc.data()['titolo'].trim().toLowerCase());
          if (index !== -1) {
            tracklistAttuale[index].id = canzoneDoc.id;
          }
        }

        if (querySnapshot.docs.length > 0) {
          const albumDocRef = doc(this.firestore, 'albums', nuovoIdGenerato);
          await updateDoc(albumDocRef, { tracklist: tracklistAttuale });
        }
      }

      await deleteDoc(doc(this.firestore, 'requests', richiesta.id));
      this.mostraToast('Content approved and added to database.');
    } catch (e) {
      console.error(e);
      this.mostraToast('Error during approval process.');
    }
  }

  async approvaTraduzioneRichiesta(richiesta: any) {
    try {
      const { songId, lingua, testo, uidUtente } = richiesta.dati;

      const translationsRef = collection(this.firestore, 'songs', songId, 'translations');
      await addDoc(translationsRef, {
        lingua: lingua,
        testo: testo,
        uidUtente: uidUtente || richiesta.uidUtente
      });

      await deleteDoc(doc(this.firestore, 'requests', richiesta.id));
      this.mostraToast('Translation approved and published.');
    } catch (e) {
      console.error(e);
      this.mostraToast('Error during translation approval.');
    }
  }

  async rifiutaRichiesta(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'requests', id));
      this.mostraToast('Request discarded and removed.');
    } catch (e) {
      this.mostraToast('Error during deletion.');
    }
  }

  private async mostraToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

}