import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonText, IonButton, IonInput, IonInputPasswordToggle } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['../login/login.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, FormsModule, IonText, IonButton, IonInput, IonInputPasswordToggle, RouterLink, NavbarComponent]
})
export class ResetPasswordPage {

  public token = '';
  public password = '';
  public confirm = '';
  public errorMessage = '';
  public done = false;
  public sending = false;

  constructor(private auth : Auth, private route : ActivatedRoute) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onReset() {
    this.errorMessage = '';

    if (!this.password || !this.confirm) {
      this.errorMessage = 'Please fill in both fields';
      return;
    }
    if (this.password !== this.confirm) {
      this.errorMessage = 'The passwords do not match';
      return;
    }

    this.sending = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.done = true;
        this.sending = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error changing the password';
        this.sending = false;
      }
    });
  }
}
