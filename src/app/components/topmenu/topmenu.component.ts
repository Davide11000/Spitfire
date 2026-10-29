import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { IonToolbar, IonSearchbar, IonTitle, IonButtons, IonButton, IonMenu, IonMenuButton, IonContent, IonList, IonItem, IonIcon, IonAvatar, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Router, RouterLink, NavigationStart } from '@angular/router';
import { personCircle, logOutOutline, search } from 'ionicons/icons';
import { UserService } from '../../services/user';
import { Authentication } from 'src/app/services/authentication';
import { Subscription } from 'rxjs';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topmenu',
  templateUrl: './topmenu.component.html',
  styleUrls: ['./topmenu.component.scss'],
  imports: [CommonModule, AsyncPipe, IonToolbar, IonSearchbar, IonTitle, IonButtons, IonButton, IonMenu, IonMenuButton, IonContent, IonList, IonItem, IonIcon, RouterLink, IonAvatar, IonLabel]
})
export class TopmenuComponent implements OnInit, OnDestroy {

  public stringaRicerca: string = '';
  
  public canzoniTrovate: any[] = [];
  public albumTrovati: any[] = [];
  public artistiTrovati: any[] = [];
  public utentiTrovati: any[] = [];
  public isAdmin: boolean = false;
  public isModerator: boolean = false;
  public searchbarMobileAperta: boolean = false;
  private adminSub!: Subscription;
  private moderatorSub!: Subscription;

  public authService = inject(Auth);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private firestore = inject(Firestore);

  constructor() {
    addIcons({ personCircle, logOutOutline, search });
  }

  ngOnInit() {
  this.adminSub = this.authService.isAdmin$.subscribe(adminStatus => {
    this.isAdmin = adminStatus;
    this.cdr.detectChanges();
  });

  this.moderatorSub = this.authService.isModerator$.subscribe(moderatorStatus => {
    this.isModerator = moderatorStatus;
    this.cdr.detectChanges();
  });

  this.router.events.pipe(
    filter(event => event instanceof NavigationStart)
  ).subscribe(() => {
    document.documentElement.style.removeProperty('--colore-topmenu-dinamico');
    this.cdr.detectChanges();
  });
}

  ngOnDestroy() {
    if (this.adminSub) this.adminSub.unsubscribe();
    if (this.moderatorSub) this.moderatorSub.unsubscribe();
  }

  haRisultati(): boolean {
    return this.canzoniTrovate.length > 0 || 
           this.albumTrovati.length > 0 || 
           this.artistiTrovati.length > 0 || 
           this.utentiTrovati.length > 0;
  }

  onCerca(event: any) {
    this.stringaRicerca = event.detail.value || '';

    if (this.stringaRicerca && this.stringaRicerca.trim().length >= 1) {
      
      try {
        this.userService.cercaUtenti(this.stringaRicerca).then(utenti => {
          if (utenti) {
            this.utentiTrovati = utenti.slice(0, 5);
            this.cdr.detectChanges();
          }
        }).catch(err => console.error(err));
      } catch (e) {
        console.error(e);
      }

      const termineOriginale = this.stringaRicerca.trim();
      const termineFormattato = termineOriginale.toLowerCase();

      const songsRef = collection(this.firestore, 'songs');
      const albumsRef = collection(this.firestore, 'albums');
      const artistsRef = collection(this.firestore, 'artists');

      const qSongs = query(songsRef, where('titolo_lowercase', '>=', termineFormattato), where('titolo_lowercase', '<=', termineFormattato + '\uf8ff'));
      const qAlbums = query(albumsRef, where('titolo_lowercase', '>=', termineFormattato), where('titolo_lowercase', '<=', termineFormattato + '\uf8ff'));
      const qArtists = query(artistsRef, where('nome_lowercase', '>=', termineFormattato), where('nome_lowercase', '<=', termineFormattato + '\uf8ff'));

      Promise.all([
        getDocs(qSongs),
        getDocs(qAlbums),
        getDocs(qArtists)
      ]).then(([songsSnap, albumsSnap, artistsSnap]) => {
        
        this.canzoniTrovate = songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3);
        this.albumTrovati = albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3);
        this.artistiTrovati = artistsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3);
        
        this.cdr.detectChanges();
      }).catch(err => console.error(err));

    } else {
      this.svuotaRicerca();
    }
  }

  svuotaRicerca() {
    this.utentiTrovati = [];
    this.canzoniTrovate = [];
    this.albumTrovati = [];
    this.artistiTrovati = [];
  }

  vaiAlProfilo(uidScelto: string) {
    if (!uidScelto) return;

    if (this.router.url === `/profile/${uidScelto}`) {
      this.svuotaRicerca();
      this.stringaRicerca = '';
      return;
    }

    this.svuotaRicerca();  
    this.stringaRicerca = '';  
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/profile', uidScelto]);
    });
  }

  vaiAllaCanzone(idCanzone: string) {
    this.svuotaRicerca();  
    this.stringaRicerca = '';  
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/songtemplate', idCanzone]);
    });
  }

  vaiAllAlbum(idAlbum: string) {
    this.svuotaRicerca();  
    this.stringaRicerca = '';  
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/albumtemplate', idAlbum]);
    });
  }

  vaiAllArtista(idArtista: string) {
    this.svuotaRicerca();  
    this.stringaRicerca = '';  
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/artisttemplate', idArtista]);
    });
  }

  apriSearchbarMobile() {
    this.searchbarMobileAperta = true;
    this.cdr.detectChanges();
  }

  chiudiSearchbarMobile() {
    this.searchbarMobileAperta = false;
    this.stringaRicerca = '';
    this.svuotaRicerca();
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
  }

}