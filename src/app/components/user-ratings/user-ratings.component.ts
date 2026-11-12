import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonButton } from '@ionic/angular';
import { Rating } from '../../services/rating';
import { RatingChartComponent } from '../rating-chart/rating-chart.component';

@Component({
  selector: 'app-user-ratings',
  templateUrl: './user-ratings.component.html',
  styleUrls: ['./user-ratings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, DecimalPipe, RatingChartComponent],
})
export class UserRatingsComponent implements OnChanges {
  @Input() username = '';

  public type = 'record';
  public rows: any = { record: [], song: [] };

  constructor(private ratingService : Rating) { }

  ngOnChanges() {
    if (!this.username) return;
    this.type = 'record';
    this.rows = { record: [], song: [] };

    for (const type of ['record', 'song']) {
      this.ratingService.getUserDistribution(this.username, type).subscribe({
        next: (res) => {
          this.rows[type] = res;
          if (type === 'record' && this.getTotal('record') === 0) this.type = 'song';
        },
        error: (err) => console.error('Error loading the ratings', err)
      });
    }
  }

  getTotal(type: string): number {
    return this.rows[type].reduce((sum: number, r: any) => sum + r.count, 0);
  }

  getAverage(type: string): number {
    const total = this.getTotal(type);
    if (total === 0) return 0;
    return this.rows[type].reduce((sum: number, r: any) => sum + r.rating * r.count, 0) / total;
  }
}
