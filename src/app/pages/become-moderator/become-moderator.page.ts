import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonTextarea, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sendOutline } from 'ionicons/icons';
import { RoleRequest } from '../../services/role-request';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-become-moderator',
  templateUrl: './become-moderator.page.html',
  styleUrls: ['./become-moderator.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, IonContent, IonButton, IonIcon, IonTextarea, IonSpinner, NavbarComponent]
})
export class BecomeModeratorPage {

  public loading = true;
  public role = '';
  public accepted = 0;
  public required = 10;
  public request: any = null;
  public text = '';
  public sending = false;
  public errorMessage = '';

  constructor(private roleRequestService : RoleRequest) {
    addIcons({ sendOutline });
  }

  ionViewWillEnter() {
    this.loadStatus();
  }

  loadStatus() {
    this.roleRequestService.getMine().subscribe({
      next: (res) => {
        this.role = res.role;
        this.accepted = res.accepted;
        this.required = res.required;
        this.request = res.request;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Error loading your status';
        this.loading = false;
      }
    });
  }

  canApply(): boolean {
    return this.accepted >= this.required;
  }

  getProgress(): number {
    return Math.min(100, this.accepted / this.required * 100);
  }

  send() {
    this.errorMessage = '';

    if (!this.text.trim()) {
      this.errorMessage = 'Tell us why you want to become a moderator';
      return;
    }

    this.sending = true;
    this.roleRequestService.send(this.text).subscribe({
      next: (res) => {
        this.request = res;
        this.text = '';
        this.sending = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Error sending the request';
        this.sending = false;
      }
    });
  }
}
