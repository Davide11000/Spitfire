import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonInput, IonInputPasswordToggle, IonTextarea, IonModal, IonSpinner, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeOutline, earthOutline, peopleOutline, banOutline, trashOutline, arrowBackOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { PROFILE_COLORS } from '../../constants/profile-colors';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, IonContent, IonButton, IonIcon, IonInput, IonInputPasswordToggle, IonTextarea, IonModal, IonSpinner, NavbarComponent]
})
export class SettingsPage implements OnInit {

  public saving = '';
  public username = '';

  public bio = '';
  public bioError = '';

  public currentEmail = '';
  public newEmail = '';
  public emailPassword = '';
  public emailError = '';

  public currentPassword = '';
  public newPassword = '';
  public confirmPassword = '';
  public passwordError = '';

  public whoCanMessage = 'everyone';
  public privacyError = '';

  public profileColors = PROFILE_COLORS;
  public profileColor: string | null = null;
  public colorError = '';

  public isDeleteOpen = false;
  public deletePassword = '';
  public deleteError = '';
  private accountDeleted = false;

  constructor(private userService : User, private auth : Auth, private router : Router, private toastC : ToastController) {
    addIcons({ checkmarkCircle, closeOutline, earthOutline, peopleOutline, banOutline, trashOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.username = this.auth.getUsernameFromToken() || '';

    this.userService.getUser(this.username).subscribe({
      next: (res) => {
        this.bio = res.bio || '';
        this.currentEmail = res.email;
        this.whoCanMessage = res.who_can_message;
        this.profileColor = res.profile_color;
      },
      error: (err) => { console.error('Error fetching user', err); }
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async showToast(message: string) {
    const toast = await this.toastC.create({
      message: message,
      icon: 'checkmark-circle',
      duration: 2500,
      position: 'bottom',
      cssClass: 'dark-toast'
    });
    await toast.present();
  }

  saveBio() {
    this.bioError = '';

    this.saving = 'bio';
    this.userService.updateBio(this.bio).subscribe({
      next: (res) => { this.saving = ''; this.showToast('Bio saved'); },
      error: (err) => { this.saving = ''; this.bioError = err.error.message || 'Error saving the bio'; }
    });
  }

  saveEmail() {
    this.emailError = '';

    if (!this.newEmail || !this.emailPassword) {
      this.emailError = 'Please write the new email and your password';
      return;
    }

    this.saving = 'email';
    this.userService.changeEmail(this.newEmail, this.emailPassword).subscribe({
      next: (res) => {
        this.saving = '';
        this.currentEmail = res.email;
        this.newEmail = '';
        this.emailPassword = '';
        this.showToast('Email changed');
      },
      error: (err) => { this.saving = ''; this.emailError = err.error.message || 'Error changing the email'; }
    });
  }

  savePassword() {
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword) {
      this.passwordError = 'Please fill in all the fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'The two new passwords are different';
      return;
    }

    this.saving = 'password';
    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (res) => {
        this.saving = '';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showToast('Password changed');
      },
      error: (err) => { this.saving = ''; this.passwordError = err.error.message || 'Error changing the password'; }
    });
  }

  chooseWhoCanMessage(choice: string) {
    this.privacyError = '';

    this.userService.updateWhoCanMessage(choice).subscribe({
      next: (res) => {
        this.whoCanMessage = res.who_can_message;
        this.showToast('Privacy saved');
      },
      error: (err) => { this.privacyError = err.error.message || 'Error saving the choice'; }
    });
  }

  chooseProfileColor(color: string | null) {
    this.colorError = '';

    this.userService.updateProfileColor(color).subscribe({
      next: (res) => {
        this.profileColor = res.profile_color;
        this.showToast('Profile color saved');
      },
      error: (err) => { this.colorError = err.error.message || 'Error saving the color'; }
    });
  }

  openDelete() {
    this.deletePassword = '';
    this.deleteError = '';
    this.isDeleteOpen = true;
  }

  deleteAccount() {
    this.deleteError = '';

    if (!this.deletePassword) {
      this.deleteError = 'Please write your password';
      return;
    }

    this.userService.deleteAccount(this.deletePassword).subscribe({
      next: (res) => {
        this.accountDeleted = true;
        this.isDeleteOpen = false;
      },
      error: (err) => { this.deleteError = err.error.message || 'Error deleting the account'; }
    });
  }

  onDeleteClosed() {
    this.isDeleteOpen = false;

    if (this.accountDeleted) {
      this.accountDeleted = false;
      this.auth.logout();
      this.router.navigate(['/home']);
    }
  }

}
