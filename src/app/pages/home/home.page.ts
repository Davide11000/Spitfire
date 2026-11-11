import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star, timeOutline, chevronForwardOutline } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Record } from '../../services/record';
import { Annotation } from '../../services/annotation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, DecimalPipe, NavbarComponent, FooterComponent],
})
export class HomePage {
  public recentRecords: any[] = [];
  public topRecords: any[] = [];
  public barOfTheDay: any = null;

  public loadingRecent = true;
  public loadingTop = true;

  // Quanti album chiedo: "Load more" aumenta il numero e ricarica la lista
  public recentLimit = 5;
  public topLimit = 5;

  constructor(private recordService : Record, private annotationService : Annotation, private router : Router) {
    addIcons({ star, timeOutline, chevronForwardOutline });
  }

  // Ricarico ogni volta che si entra nella Home: possono esserci album o annotazioni nuove
  ionViewWillEnter() {
    this.loadRecent();
    this.loadTop();

    this.annotationService.getLatest().subscribe({
      next: (res) => { this.barOfTheDay = res; },
      error: (err) => console.error(err)
    });
  }

  loadRecent() {
    this.recordService.getRecentRecords(this.recentLimit).subscribe({
      next: (res) => {
        this.recentRecords = res;
        this.loadingRecent = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingRecent = false;
      }
    });
  }

  loadTop() {
    this.recordService.getTopRatedRecords(this.topLimit).subscribe({
      next: (res) => {
        this.topRecords = res;
        this.loadingTop = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingTop = false;
      }
    });
  }

  moreRecent() {
    this.recentLimit += 5;
    this.loadRecent();
  }

  moreTop() {
    this.topLimit += 5;
    this.loadTop();
  }

  getCover(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  goToAlbum(id: number) {
    this.router.navigate(['/records', id]);
  }

  goToArtist(event: any, id: number) {
    event.stopPropagation();
    this.router.navigate(['/artists', id]);
  }

  goToBar() {
    this.router.navigate(['/songs', this.barOfTheDay.song_id], { queryParams: { annotation: this.barOfTheDay.id } });
  }
}
