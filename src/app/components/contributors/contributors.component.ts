import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { Contribution } from '../../services/contribution';

@Component({
  selector: 'app-contributors',
  templateUrl: './contributors.component.html',
  styleUrls: ['./contributors.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonIcon],
})
export class ContributorsComponent implements OnChanges {
  @Input() type!: string;
  @Input() id!: number | string;
  @Input() version: any = null;

  public contributors: any[] = [];
  public open = false;

  constructor(private contributionService : Contribution, private router : Router) {
    addIcons({ peopleOutline, chevronDownOutline, chevronUpOutline });
  }

  ngOnChanges() {
    this.open = false;
    if (!this.type || this.id === null || this.id === undefined) return;

    this.contributionService.getContributors(this.type, Number(this.id)).subscribe({
      next: (res) => { this.contributors = res; },
      error: (err) => console.error(err)
    });
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  goToProfile(username: string) {
    this.router.navigate(['/profile', username]);
  }
}
