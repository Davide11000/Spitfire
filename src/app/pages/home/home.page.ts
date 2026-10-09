import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButton, 
  IonIcon, 
  IonSpinner
} from '@ionic/angular';
import { TopmenuComponent } from "../../components/topmenu/topmenu.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { addIcons } from 'ionicons';
import { musicalNotesOutline, peopleOutline, star, timeOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonSpinner,
    TopmenuComponent,
    FooterComponent
],
})
export class HomePage implements OnInit {
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  public recentSongs: any[] = [];
  public topRatedSongs: any[] = [];

  public caricamentoRecenti: boolean = true;
  public caricamentoTop: boolean = true;
  public caricamentoAltriRecenti: boolean = false;
  public caricamentoAltriTop: boolean = false;

  public altreRecentSongs: boolean = true;
  public altreTopSongs: boolean = true;

  private lastRecentDoc: QueryDocumentSnapshot | null = null;
  private lastTopDoc: QueryDocumentSnapshot | null = null;

  private readonly LIMIT_RECENTI = 5;
  private readonly LIMIT_TOP = 4;

  constructor() {
    addIcons({ musicalNotesOutline, peopleOutline, star, timeOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.caricaContenutiRecenti();
    this.caricaContenutiTopRated();
  }

  async caricaContenutiRecenti() {
    try {
      const songsRef = collection(this.firestore, 'songs');
      const q = query(songsRef, orderBy('titolo', 'asc'), limit(this.LIMIT_RECENTI));
      const querySnapshot = await getDocs(q);
      this.recentSongs = [];
      querySnapshot.forEach((doc) => {
        this.recentSongs.push({ id: doc.id, ...doc.data() });
      });
      this.lastRecentDoc = querySnapshot.docs[querySnapshot.docs.length - 1] ?? null;
      this.altreRecentSongs = querySnapshot.docs.length === this.LIMIT_RECENTI;
    } catch (error) {
      console.error(error);
    } finally {
      this.caricamentoRecenti = false;
      this.cdr.detectChanges();
    }
  }

  async caricaAltreRecenti() {
    if (!this.lastRecentDoc || this.caricamentoAltriRecenti) return;
    this.caricamentoAltriRecenti = true;
    try {
      const songsRef = collection(this.firestore, 'songs');
      const q = query(songsRef, orderBy('titolo', 'asc'), startAfter(this.lastRecentDoc), limit(this.LIMIT_RECENTI));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        this.recentSongs.push({ id: doc.id, ...doc.data() });
      });
      this.lastRecentDoc = querySnapshot.docs[querySnapshot.docs.length - 1] ?? this.lastRecentDoc;
      this.altreRecentSongs = querySnapshot.docs.length === this.LIMIT_RECENTI;
    } catch (error) {
      console.error(error);
    } finally {
      this.caricamentoAltriRecenti = false;
      this.cdr.detectChanges();
    }
  }

  async caricaContenutiTopRated() {
    try {
      const songsRef = collection(this.firestore, 'songs');
      const q = query(songsRef, limit(this.LIMIT_TOP));
      const querySnapshot = await getDocs(q);
      this.topRatedSongs = [];
      querySnapshot.forEach((doc) => {
        this.topRatedSongs.push({ id: doc.id, ...doc.data() });
      });
      this.lastTopDoc = querySnapshot.docs[querySnapshot.docs.length - 1] ?? null;
      this.altreTopSongs = querySnapshot.docs.length === this.LIMIT_TOP;
    } catch (error) {
      console.error(error);
    } finally {
      this.caricamentoTop = false;
      this.cdr.detectChanges();
    }
  }

  async caricaAltreTop() {
    if (!this.lastTopDoc || this.caricamentoAltriTop) return;
    this.caricamentoAltriTop = true;
    try {
      const songsRef = collection(this.firestore, 'songs');
      const q = query(songsRef, startAfter(this.lastTopDoc), limit(this.LIMIT_TOP));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        this.topRatedSongs.push({ id: doc.id, ...doc.data() });
      });
      this.lastTopDoc = querySnapshot.docs[querySnapshot.docs.length - 1] ?? this.lastTopDoc;
      this.altreTopSongs = querySnapshot.docs.length === this.LIMIT_TOP;
    } catch (error) {
      console.error(error);
    } finally {
      this.caricamentoAltriTop = false;
      this.cdr.detectChanges();
    }
  }
}