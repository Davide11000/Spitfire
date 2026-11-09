import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star, starHalf, starOutline } from 'ionicons/icons';
import { Rating } from '../../services/rating';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonIcon, DecimalPipe],
})
export class RatingStarsComponent implements OnChanges {
  @Input() type!: 'song' | 'record';
  @Input() id!: number | string;

  public average = 0;
  public count = 0;
  public myRating = 0;
  public hover = 0;
  public stars = [1, 2, 3, 4, 5];

  constructor(private ratingService : Rating, private auth : Auth, private router : Router) {
    addIcons({ star, starHalf, starOutline });
  }

  ngOnChanges() {
    if (!this.type || this.id === null || this.id === undefined) return;

    this.hover = 0;
    this.ratingService.getRating(this.type, Number(this.id)).subscribe({
      next: (res) => { this.setSummary(res); },
      error: (err) => { console.error('Error fetching rating', err); }
    });
  }

  setSummary(res: any) {
    this.average = res.average;
    this.count = res.count;
    this.myRating = res.myRating;
  }

  // Se il mouse è sulla metà sinistra della stella vale mezza stella
  getValue(event: MouseEvent, n: number): number {
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (event.clientX - box.left < box.width / 2) return n - 0.5;
    return n;
  }

  getIcon(n: number): string {
    const value = this.hover || this.myRating;
    if (value >= n) return 'star';
    if (value >= n - 0.5) return 'star-half';
    return 'star-outline';
  }

  onMove(event: MouseEvent, n: number) {
    this.hover = this.getValue(event, n);
  }

  onLeave() {
    this.hover = 0;
  }

  onClick(event: MouseEvent, n: number) {
    if (!this.auth.getUsernameFromToken()) {
      this.router.navigate(['/login']);
      return;
    }

    const value = this.getValue(event, n);

    // Cliccando di nuovo sullo stesso voto lo tolgo
    if (value === this.myRating) {
      this.ratingService.removeRating(this.type, Number(this.id)).subscribe({
        next: (res) => { this.setSummary(res); },
        error: (err) => { console.error('Error removing rating', err); }
      });
      return;
    }

    this.ratingService.rate(this.type, Number(this.id), value).subscribe({
      next: (res) => { this.setSummary(res); },
      error: (err) => { console.error('Error saving rating', err); }
    });
  }
}
