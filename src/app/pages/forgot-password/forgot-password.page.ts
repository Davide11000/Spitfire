import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonText, IonButton, IonInput } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['../login/login.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, FormsModule, IonText, IonButton, IonInput, RouterLink, NavbarComponent]
})
export class ForgotPasswordPage {

  public email = '';
  public errorMessage = '';
  public message = '';
  public sending = false;

  constructor(private auth : Auth) { }

  onSend() {
    this.errorMessage = '';
    this.message = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Please write your email';
      return;
    }

    this.sending = true;
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.message = res.message;
        this.sending = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error sending the email';
        this.sending = false;
      }
    });
  }
}
