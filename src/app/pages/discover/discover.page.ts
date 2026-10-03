import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { IonContent, IonLabel, IonList, IonItem, IonButtons, IonButton, IonIcon, IonToolbar, IonCheckbox, IonSearchbar, IonImg } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, closeCircleSharp, refreshOutline } from 'ionicons/icons';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { GENERI_DISPONIBILI } from '../constants/generi';
import { LINGUE_DISPONIBILI } from '../constants/lingue';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  imports: [IonContent, TopmenuComponent, FooterComponent,
    IonLabel, FormsModule, IonButtons, IonButton, IonList, IonItem, IonCheckbox, IonToolbar, IonSearchbar, IonImg]
})
export class DiscoverPage implements OnInit {
  public genreInput = '';
  public langInput = '';
  public searchResults: string[] = [];
  public langSearchResults: string[] = [];
  private cdr = inject(ChangeDetectorRef);
  genres: string[] = [];
  eras: number[] = [];
  langs: string[] = [];
  albums: any[] = [];

  current: string = "genres";

  private router = inject(Router);

  constructor() { addIcons({addCircleOutline, closeCircleSharp, refreshOutline}); }

  ngOnInit() {
  }

  displayResults(s: string) {
    this.searchResults = [];
    if (s != '') {      
      GENERI_DISPONIBILI.forEach(genre => {
        if (genre.toLowerCase().startsWith(s.trim().toLowerCase())) {
          if (!this.genres.includes(genre)) {
            this.searchResults.push(genre);
          }
        }
      });
      GENERI_DISPONIBILI.forEach(genre => {
        if (genre.toLowerCase().includes(s.trim().toLowerCase())) {
          if (!this.searchResults.includes(genre) && !this.genres.includes(genre)) {
            this.searchResults.push(genre);
          }
        }
      });
    }
  }

  displayLangs(s: string) {
    this.langSearchResults = [];
    if (s != '') {      
      LINGUE_DISPONIBILI.forEach(lang => {
        if (lang.toLowerCase().startsWith(s.trim().toLowerCase())) {
          if (!this.langs.includes(lang)) {
            this.langSearchResults.push(lang);
          }
        }
      });
      LINGUE_DISPONIBILI.forEach(lang => {
        if (lang.toLowerCase().includes(s.trim().toLowerCase())) {
          if (!this.langSearchResults.includes(lang) && !this.langs.includes(lang)) {
            this.langSearchResults.push(lang);
          }
        }
      });
    }
  }

  addGenre(s: string) {
    this.genreInput = '';
    this.searchResults = [];
    this.genres.push(s);
  }

  addLang(s: string) {
    this.langInput = '';
    this.langSearchResults = [];
    this.langs.push(s);
  }

  removeGenre(s: string) {
    let i = 0;
    while (i < this.genres.length) {
      if (this.genres[0] == s) {
        this.genres.shift();
      }
      else
      {
        this.genres.push(this.genres.shift() ?? "error");
        i++;
      }
    }
  }

  removeLang(s: string) {
    let i = 0;
    while (i < this.langs.length) {
      if (this.langs[0] == s) {
        this.langs.shift();
      }
      else
      {
        this.langs.push(this.langs.shift() ?? "error");
        i++;
      }
    }
  }

  toggleEra(s: number) {
    if (this.eras.includes(s)) {
      let i = 0;
      while (i < this.eras.length) {
        if (this.eras[0] == s) {
          this.eras.shift();
        }
        else
        {
          this.eras.push(this.eras.shift() ?? 2000);
          i++;
        }
      }
    }
    else {
      this.eras.push(s);
    }
  }

  changeQuestion(s: string) {
    if (this.current == 'genres' && this.genres.length == 0) {
      alert("You must choose at least 1 genre!");
    }
    else if (this.current == 'era' && this.eras.length == 0) {
      alert("You must select at least 1 era!");
    }
    else {
      this.current = s;
      if (s == 'end') {
        this.findRecords();
      }
    }
  }

  goToAlbum(idAlbum: string) {
    this.router.navigate(['/albumtemplate/' + idAlbum])
  }

  findRecords() {
    this.eras.sort();

    const modified = this.eras.map(x => x + "-00-00");
    const albumsRef = collection(this.Firestore, 'albums');
    const constraints: QueryConstraint[] = [];

    constraints.push(where('generi', 'array-contains-any', this.genres));

    if (this.langs && this.langs.length > 0) {
      constraints.push(where('lingua', 'in', this.langs));
    }
    
    constraints.push(where('dataRilascio', ">=", modified[0]), where('dataRilascio', "<", 
      modified[modified.length - 1].replace(this.eras[this.eras.length - 1].toString(), (this.eras[this.eras.length - 1] + 10).toString())));

    const qAlbums = query(albumsRef, ...constraints);

      console.log(this.eras);
      
      Promise.all([
        getDocs(qAlbums),
      ]).then(([albumsSnap]) => {
        this.albums = albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 5); 
        this.cdr.detectChanges();
      }).catch(err => console.error(err));
      console.log(this.albums);
  }
}
