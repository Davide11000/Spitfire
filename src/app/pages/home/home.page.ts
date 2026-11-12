import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star, timeOutline, chevronForwardOutline, calendarOutline } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Record } from '../../services/record';
import { Artist } from '../../services/artist';
import { Annotation } from '../../services/annotation';

const SIMULATED_DAY: string | null = '10-02';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, DecimalPipe, DatePipe, NavbarComponent, FooterComponent],
})
export class HomePage {
  public recentRecords: any[] = [];
  public topRecords: any[] = [];
  public barOfTheDay: any = null;
  public todayRecords: any[] = [];
  public todayArtists: any[] = [];
  public today = new Date();

  public loadingRecent = true;
  public loadingTop = true;

  public recentLimit = 5;
  public topLimit = 5;

  constructor(private recordService : Record, private artistService : Artist, private annotationService : Annotation, private router : Router) {
    addIcons({ star, timeOutline, chevronForwardOutline, calendarOutline });
  }

  ionViewWillEnter() {
    this.loadRecent();
    this.loadTop();

    this.today = new Date();
    if (SIMULATED_DAY) {
      const [month, day] = SIMULATED_DAY.split('-').map(Number);
      this.today = new Date(this.today.getFullYear(), month - 1, day);
    }
    const day = String(this.today.getMonth() + 1).padStart(2, '0') + '-' + String(this.today.getDate()).padStart(2, '0');

    this.recordService.getOnThisDay(day).subscribe({
      next: (res) => { this.todayRecords = res; },
      error: (err) => console.error(err)
    });
    this.artistService.getOnThisDay(day).subscribe({
      next: (res) => { this.todayArtists = res; },
      error: (err) => console.error(err)
    });

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

  getYearsAgo(date: string): number {
    return this.today.getFullYear() - Number(date.substring(0, 4));
  }

  goToArtistPage(id: number) {
    this.router.navigate(['/artists', id]);
  }

  getPhoto(image: string | null): string {
    if (!image) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + image;
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
