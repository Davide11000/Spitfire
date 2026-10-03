import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonSearchbar, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline, chevronDownOutline, chevronUpOutline, folderOpenOutline } from 'ionicons/icons';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.page.html',
  styleUrls: ['./lists.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSearchbar, IonIcon, TopmenuComponent, FooterComponent]
})
export class ListsPage implements OnInit {

  // gestione Tab e Ricerca
  public tabAttiva: 'recently' | 'popular' | 'favorites' = 'recently';
  public queryRicerca: string = '';

  public tutteLePlaylist: any[] = [];
  public playlistVisualizzate: any[] = [];
  public idPlaylistPreferite: string[] = [];
  
  public mioUid: string | null = null;

  private router = inject(Router);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ heart, heartOutline, chevronDownOutline, chevronUpOutline, folderOpenOutline });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.mioUid = user.uid;
        this.caricaPreferitiUtente();
      } else {
        this.mioUid = null;
        this.idPlaylistPreferite = [];
      }
    });

    this.caricaPlaylistGlobali();
  }

  async caricaPlaylistGlobali() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'playlists'));
      this.tutteLePlaylist = querySnapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          mostraAnteprima: true, 
          ...data
        };
      });
      
      this.tutteLePlaylist = this.tutteLePlaylist.filter(p => p.pubblica === true);
      
      this.filtraPlaylist();
    } catch (error) {
      console.error('Errore nel caricamento delle playlist:', error);
    }
  }

  async caricaPreferitiUtente() {
    if (!this.mioUid) return;
    try {
      const userDocRef = doc(this.firestore, 'utenti', this.mioUid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        this.idPlaylistPreferite = data['playlistSalvate'] || [];
        if (this.tabAttiva === 'favorites') {
          this.filtraPlaylist();
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento dei preferiti:', error);
    }
  }
  cambiaTab(tab: 'recently' | 'popular' | 'favorites') {
    this.tabAttiva = tab;
    this.filtraPlaylist();
  }

  filtraPlaylist() {
    let ris = [...this.tutteLePlaylist];

    if (this.tabAttiva === 'recently') {
      ris.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
    } else if (this.tabAttiva === 'popular') {
      ris.sort((a, b) => (b.canzoni?.length || 0) - (a.canzoni?.length || 0));
    } else if (this.tabAttiva === 'favorites') {
      ris = ris.filter(p => this.idPlaylistPreferite.includes(p.id));
    }

    const query = this.queryRicerca.toLowerCase().trim();
    if (query) {
      ris = ris.filter(p => 
        (p.nome && p.nome.toLowerCase().includes(query)) ||
        (p.creatoreNome && p.creatoreNome.toLowerCase().includes(query))
      );
    }

    this.playlistVisualizzate = ris;
    this.cdr.detectChanges();
  }

  isPreferita(playlistId: string): boolean {
    return this.idPlaylistPreferite.includes(playlistId);
  }

  async togglePreferiti(playlist: any, event: Event) {
    event.stopPropagation();
    if (!this.mioUid) {
      alert('Devi essere loggato per salvare le playlist nei preferiti!');
      return;
    }

    const userDocRef = doc(this.firestore, 'utenti', this.mioUid);

    if (this.isPreferita(playlist.id)) {
      // Rimuovi dai preferiti
      this.idPlaylistPreferite = this.idPlaylistPreferite.filter(id => id !== playlist.id);
      await updateDoc(userDocRef, {
        playlistSalvate: arrayRemove(playlist.id)
      });
    } else {
      // Aggiungi ai preferiti
      this.idPlaylistPreferite.push(playlist.id);
      await updateDoc(userDocRef, {
        playlistSalvate: arrayUnion(playlist.id)
      });
    }

    if (this.tabAttiva === 'favorites') {
      this.filtraPlaylist();
    } else {
      this.cdr.detectChanges();
    }
  }

  apriPlaylist(idPlaylist: string) {
    this.router.navigate(['/playlist', idPlaylist]);
  }

  vaiAlProfilo(uidCreatore: string) {
    if (uidCreatore) {
      this.router.navigate(['/profile', uidCreatore]);
    }
  }

  trasformaData(timestamp: any): string {
    if (!timestamp) return '';
    let data: Date;
    if (timestamp.seconds) {
      data = new Date(timestamp.seconds * 1000);
    } else {
      data = new Date(timestamp);
    }
    return data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}