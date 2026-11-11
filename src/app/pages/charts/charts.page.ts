import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star, playSkipBack, playSkipForward, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { Chart } from '../../services/chart';
import { Genre } from '../../services/genre';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonIcon, IonSpinner, IonSegment, IonSegmentButton, IonLabel,
            FormsModule, DecimalPipe, NavbarComponent, FooterComponent]
})
export class ChartsPage {

  public type = 'record';
  public year = '';
  public years: string[] = [];
  public genre = '';
  public genres: any[] = [];

  public items: any[] = [];
  public total = 0;
  public page = 1;
  public totalPages = 0;
  public pageSize = 20;
  public loading = true;

  public openMenu = '';

  constructor(private chartService : Chart, private genreService : Genre, private router : Router) {
    addIcons({ star, playSkipBack, playSkipForward, chevronDownOutline, chevronUpOutline });
  }

  // Ricarico a ogni ingresso: i voti possono essere cambiati
  ionViewWillEnter() {
    this.chartService.getYears().subscribe({
      next: (res) => { this.years = res; },
      error: (err) => console.error('Error loading the years', err)
    });

    this.genreService.getAllGenres().subscribe({
      next: (res) => { this.genres = res; },
      error: (err) => console.error('Error loading the genres', err)
    });

    this.loadChart(this.page);
  }

  loadChart(page: number) {
    this.loading = true;

    this.chartService.getChart(this.type, this.year, this.genre, page).subscribe({
      next: (res) => {
        this.items = res.items;
        this.total = res.total;
        this.page = res.page;
        this.totalPages = res.totalPages;
        this.pageSize = res.pageSize;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading the chart', err);
        this.loading = false;
      }
    });
  }

  onTypeChange(event: any) {
    this.type = event.detail.value;
    this.loadChart(1);
  }

  toggleMenu(menu: string) {
    this.openMenu = this.openMenu === menu ? '' : menu;
  }

  chooseYear(year: string) {
    this.year = year;
    this.openMenu = '';
    this.loadChart(1);
  }

  chooseGenre(genre: string) {
    this.genre = genre;
    this.openMenu = '';
    this.loadChart(1);
  }

  getSubtitle(): string {
    let text = 'The best rated ' + (this.genre ? this.genre + ' ' : '') + (this.type === 'record' ? 'records' : 'songs');
    text += this.year ? ' of ' + this.year : ' of all time';
    return text + '.';
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.loadChart(page);
  }

  // Pagine da mostrare: la prima, l'ultima e quelle vicine alla pagina attuale; nei buchi metto "..." (0)
  getPageButtons(): number[] {
    const buttons: number[] = [];

    for (let p = 1; p <= this.totalPages; p++) {
      if (p === 1 || p === this.totalPages || Math.abs(p - this.page) <= 1) {
        buttons.push(p);
      } else if (buttons[buttons.length - 1] !== 0) {
        buttons.push(0);
      }
    }

    return buttons;
  }

  getRank(index: number): number {
    return (this.page - 1) * this.pageSize + index + 1;
  }

  getCover(item: any): string {
    const image = item.image || item.recordimage;
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  goToItem(item: any) {
    if (this.type === 'record') this.router.navigate(['/records', item.id]);
    else this.router.navigate(['/songs', item.id]);
  }

  goToArtist(event: any, item: any) {
    event.stopPropagation();
    if (item.artist_id !== null) this.router.navigate(['/artists', item.artist_id]);
  }
}
