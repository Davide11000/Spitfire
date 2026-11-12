import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-rating-chart',
  templateUrl: './rating-chart.component.html',
  styleUrls: ['./rating-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RatingChartComponent {
  @Input() rows: any[] = [];
  @Input() light = false;
  @Input() height = 110;

  public values = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  getCount(value: number): number {
    const row = this.rows.find(r => Number(r.rating) === value);
    return row ? row.count : 0;
  }

  getHeight(value: number): number {
    const max = Math.max(...this.values.map(v => this.getCount(v)));
    if (max === 0) return 0;
    return this.getCount(value) / max * 100;
  }
}
