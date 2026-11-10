import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonTextarea, AlertController } from '@ionic/angular';
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
  imports: [IonButton, IonIcon, IonTextarea, CommentsComponent, ContributorsComponent],
})
export class AboutComponent implements OnChanges {
  @Input() recordId!: number;
  @Input() albumName = '';

  public about: any = null;
  public loading = true;

  public mioNome: string | null = null;
  public canModerate = false;

  public scrivendo = false;
  public modificando = false;
  public testo = '';
  public errore = '';
  public messaggio = '';
  public inviando = false;

  constructor(private aboutService : About, private auth : Auth, private userService : User, private router : Router,
              private alertC : AlertController) {
    addIcons({ thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, createOutline, checkmarkOutline, trashOutline });
  }

  ngOnChanges() {
    if (this.recordId === null || this.recordId === undefined) return;

    this.mioNome = this.auth.getUsernameFromToken();
    this.canModerate = false;
    this.scrivendo = false;
    this.modificando = false;
    this.errore = '';
    this.messaggio = '';

    if (this.mioNome) {
      this.userService.getUserRole(this.mioNome).subscribe({
        next: (res) => { this.canModerate = res.ruolo === 'admin' || res.ruolo === 'moderatore'; },
        error: (err) => console.error(err)
      });
    }

    this.carica();
  }

  carica() {
    this.loading = true;
    this.aboutService.getByRecord(this.recordId).subscribe({
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

  vaiAlLogin() {
    this.router.navigate(['/login']);
  }

  onTesto(event: any) {
    this.testo = event.detail.value;
    this.errore = '';
  }

  apriScrittura() {
    if (!this.mioNome) {
      this.vaiAlLogin();
      return;
    }
    this.testo = '';
    this.messaggio = '';
    this.scrivendo = true;
  }

  invia() {
    if (!this.testo.trim()) {
      this.errore = 'Write something about the album';
      return;
    }

    this.inviando = true;
    this.aboutService.create(this.recordId, this.testo).subscribe({
      next: (res) => {
        this.inviando = false;
        this.scrivendo = false;
        this.messaggio = res.status === 'pending' ? 'Thanks! A moderator will review it soon.' : '';
        this.carica();
      },
      error: (err) => {
        this.inviando = false;
        this.errore = err.error.message || 'Error sending the about';
      }
    });
  }

  approva() {
    this.aboutService.approve(this.about.id).subscribe({
      next: () => this.carica(),
      error: (err) => { this.errore = err.error.message || 'Error approving the about'; }
    });
  }

  rifiuta() {
    this.aboutService.reject(this.about.id).subscribe({
      next: () => this.carica(),
      error: (err) => { this.errore = err.error.message || 'Error rejecting the about'; }
    });
  }

  async elimina() {
    const alert = await this.alertC.create({
      header: 'Delete about?',
      message: 'The about, its votes and its suggestions will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => {
          this.aboutService.delete(this.about.id).subscribe({
            next: () => this.carica(),
            error: (err) => { this.errore = err.error.message || 'Error deleting the about'; }
          });
        } }
      ]
    });
    await alert.present();
  }

  // Mi piace = +1, non mi piace = -1; cliccando di nuovo lo stesso voto lo tolgo
  vota(valore: number) {
    if (!this.mioNome) {
      this.vaiAlLogin();
      return;
    }

    const nuovo = this.about.my_vote === valore ? 0 : valore;
    this.aboutService.vote(this.about.id, nuovo).subscribe({
      next: (res) => {
        this.about.score = res.score;
        this.about.my_vote = res.my_vote;
      },
      error: (err) => console.error(err)
    });
  }

  getPunteggio(score: number): string {
    if (score > 0) return '+' + score;
    return String(score);
  }

  apriModifica() {
    if (!this.mioNome) {
      this.vaiAlLogin();
      return;
    }
    this.testo = this.about.text;
    this.messaggio = '';
    this.modificando = true;
  }

  inviaModifica() {
    if (!this.testo.trim()) {
      this.errore = 'The about cannot be empty';
      return;
    }

    this.inviando = true;
    this.aboutService.proposeEdit(this.about.id, this.testo).subscribe({
      next: (res) => {
        this.inviando = false;
        this.modificando = false;
        this.messaggio = res.status === 'pending' ? 'Edit sent! A moderator will review it soon.' : '';
        this.carica();
      },
      error: (err) => {
        this.inviando = false;
        this.errore = err.error.message || 'Error sending the edit';
      }
    });
  }

  approvaModifica(e: any) {
    this.aboutService.approveEdit(e.id).subscribe({
      next: () => this.carica(),
      error: (err) => { this.errore = err.error.message || 'Error approving the edit'; }
    });
  }

  rifiutaModifica(e: any) {
    this.aboutService.rejectEdit(e.id).subscribe({
      next: () => this.carica(),
      error: (err) => { this.errore = err.error.message || 'Error rejecting the edit'; }
    });
  }
}
