import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonSpinner, IonIcon, IonTextarea, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, createOutline, checkmarkOutline, trashOutline } from 'ionicons/icons';
import { About } from '../../services/about';
import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { CommentsComponent } from '../comments/comments.component';
import { ContributorsComponent } from '../contributors/contributors.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonSpinner, IonIcon, IonTextarea, CommentsComponent, ContributorsComponent],
})
export class AboutComponent implements OnChanges {
  @Input() type = 'record';
  @Input() targetId!: number;
  @Input() name = '';

  public about: any = null;
  public loading = true;

  public myUsername: string | null = null;
  public canModerate = false;

  public writing = false;
  public editing = false;
  public text = '';
  public errorMessage = '';
  public infoMessage = '';
  public sending = false;

  constructor(private aboutService : About, private auth : Auth, private userService : User, private router : Router,
              private alertC : AlertController) {
    addIcons({ thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, createOutline, checkmarkOutline, trashOutline });
  }

  ngOnChanges() {
    if (this.targetId === null || this.targetId === undefined) return;

    this.myUsername = this.auth.getUsernameFromToken();
    this.canModerate = false;
    this.writing = false;
    this.editing = false;
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.myUsername) {
      this.userService.getUserRole(this.myUsername).subscribe({
        next: (res) => { this.canModerate = res.ruolo === 'admin'; },
        error: (err) => console.error(err)
      });
    }

    this.load();
  }

  load() {
    this.loading = true;
    this.aboutService.getByTarget(this.type, this.targetId).subscribe({
      next: (res) => {
        this.about = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onTextInput(event: any) {
    this.text = event.detail.value;
    this.errorMessage = '';
  }

  openWrite() {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }
    this.text = '';
    this.infoMessage = '';
    this.writing = true;
  }

  send() {
    if (!this.text.trim()) {
      this.errorMessage = 'Write something first';
      return;
    }

    this.sending = true;
    this.aboutService.create(this.type, this.targetId, this.text).subscribe({
      next: (res) => {
        this.sending = false;
        this.writing = false;
        this.infoMessage = res.status === 'pending' ? 'Thanks! A moderator will review it soon.' : '';
        this.load();
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error.message || 'Error sending the text';
      }
    });
  }

  approve() {
    this.aboutService.approve(this.about.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMessage = err.error.message || 'Error approving the text'; }
    });
  }

  reject() {
    this.aboutService.reject(this.about.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMessage = err.error.message || 'Error rejecting the text'; }
    });
  }

  async onDelete() {
    const alert = await this.alertC.create({
      header: 'Delete this text?',
      message: 'The text, its votes and its suggestions will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => {
          this.aboutService.delete(this.about.id).subscribe({
            next: () => this.load(),
            error: (err) => { this.errorMessage = err.error.message || 'Error deleting the text'; }
          });
        } }
      ]
    });
    await alert.present();
  }

  vote(value: number) {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    const newValue = this.about.my_vote === value ? 0 : value;
    this.aboutService.vote(this.about.id, newValue).subscribe({
      next: (res) => {
        this.about.score = res.score;
        this.about.my_vote = res.my_vote;
      },
      error: (err) => console.error(err)
    });
  }

  getScore(score: number): string {
    if (score > 0) return '+' + score;
    return String(score);
  }

  openEdit() {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }
    this.text = this.about.text;
    this.infoMessage = '';
    this.editing = true;
  }

  sendEdit() {
    if (!this.text.trim()) {
      this.errorMessage = 'The text cannot be empty';
      return;
    }

    this.sending = true;
    this.aboutService.proposeEdit(this.about.id, this.text).subscribe({
      next: (res) => {
        this.sending = false;
        this.editing = false;
        this.infoMessage = res.status === 'pending' ? 'Edit sent! A moderator will review it soon.' : '';
        this.load();
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error.message || 'Error sending the edit';
      }
    });
  }

  approveEdit(e: any) {
    this.aboutService.approveEdit(e.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMessage = err.error.message || 'Error approving the edit'; }
    });
  }

  rejectEdit(e: any) {
    this.aboutService.rejectEdit(e.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMessage = err.error.message || 'Error rejecting the edit'; }
    });
  }
}
