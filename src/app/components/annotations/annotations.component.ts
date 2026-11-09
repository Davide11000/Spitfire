import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonTextarea, IonModal, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, closeOutline, createOutline, checkmarkOutline, trashOutline, flagOutline, checkmarkCircle } from 'ionicons/icons';
import { Annotation } from '../../services/annotation';
import { Auth } from '../../services/auth';
import { Report } from '../../services/report';
import { User } from '../../services/user';
import { CommentsComponent } from '../comments/comments.component';
import { ContributorsComponent } from '../contributors/contributors.component';

@Component({
  selector: 'app-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonIcon, IonTextarea, IonModal, CommentsComponent, ContributorsComponent],
})
export class AnnotationsComponent implements OnChanges {
  @Input() songId!: number;
  @Input() lyrics: string | null = null;
  @Input() openId: number | null = null;

  public testo = '';
  public annotazioni: any[] = [];
  public segmenti: any[] = [];

  public mioNome: string | null = null;
  public canModerate = false;

  public selezione: any = null;
  public aperta: any = null;
  public nuovoTesto = '';
  public modificaAperta = false;
  public testoModifica = '';
  public errore = '';
  public messaggio = '';
  public inviando = false;

  public segnalazioneAperta = false;
  public motivo = '';
  public erroreSegnalazione = '';
  public segnalando = false;
  public motivi = ['Wrong meaning', 'Spam', 'Offensive language', 'Copied from elsewhere', 'Off topic'];

  constructor(private annotationService : Annotation, private auth : Auth, private userService : User, private router : Router,
              private alertC : AlertController, private reportService : Report, private toastC : ToastController) {
    addIcons({ thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, closeOutline, createOutline, checkmarkOutline, trashOutline, flagOutline, checkmarkCircle });
  }

  ngOnChanges() {
    this.testo = (this.lyrics || '').replace(/\r\n/g, '\n');
    this.mioNome = this.auth.getUsernameFromToken();
    this.canModerate = false;

    if (this.mioNome) {
      this.userService.getUserRole(this.mioNome).subscribe({
        next: (res) => { this.canModerate = res.ruolo === 'admin' || res.ruolo === 'moderatore'; },
        error: (err) => console.error(err)
      });
    }

    this.caricaAnnotazioni();
  }

  caricaAnnotazioni() {
    if (!this.songId) return;

    this.annotationService.getBySong(this.songId).subscribe({
      next: (res) => {
        this.annotazioni = res;
        this.costruisciSegmenti();

        const daAprire = this.aperta ? this.aperta.id : this.openId;
        if (daAprire) {
          const a = this.annotazioni.find(x => x.id === Number(daAprire));
          if (a) this.aperta = a;
        }
      },
      error: (err) => console.error(err)
    });
  }

  costruisciSegmenti() {
    this.segmenti = [];
    let posizione = 0;

    const valide = this.annotazioni
      .filter(a => this.testo.substring(a.start_index, a.end_index) === a.selected_text)
      .sort((a, b) => a.start_index - b.start_index);

    for (const a of valide) {
      if (a.start_index < posizione) continue;
      if (a.start_index > posizione) {
        this.segmenti.push({ testo: this.testo.substring(posizione, a.start_index), annotazione: null });
      }
      this.segmenti.push({ testo: a.selected_text, annotazione: a });
      posizione = a.end_index;
    }

    if (posizione < this.testo.length) {
      this.segmenti.push({ testo: this.testo.substring(posizione), annotazione: null });
    }
  }

  onSelezione(box: HTMLElement) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!box.contains(range.startContainer) || !box.contains(range.endContainer)) return;

    const prima = document.createRange();
    prima.selectNodeContents(box);
    prima.setEnd(range.startContainer, range.startOffset);

    let start = prima.toString().length;
    let end = start + range.toString().length;

    while (start < end && /\s/.test(this.testo[start])) start++;
    while (end > start && /\s/.test(this.testo[end - 1])) end--;
    if (start >= end) return;

    this.selezione = { start, end, testo: this.testo.substring(start, end) };
    this.aperta = null;
    this.nuovoTesto = '';
    this.errore = '';
    this.messaggio = '';
  }

  apriAnnotazione(a: any) {
    this.aperta = a;
    this.selezione = null;
    this.modificaAperta = false;
    this.errore = '';
    this.messaggio = '';
  }

  chiudi() {
    this.aperta = null;
    this.selezione = null;
    this.modificaAperta = false;
    this.errore = '';
    this.messaggio = '';
    window.getSelection()?.removeAllRanges();
  }

  vaiAlLogin() {
    this.router.navigate(['/login']);
  }

  vaiAlProfilo(username: string | null) {
    if (username) this.router.navigate(['/profile', username]);
  }

  getFoto(foto: string | null): string {
    if (!foto) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + foto;
  }

  onNuovoTesto(event: any) {
    this.nuovoTesto = event.detail.value;
    this.errore = '';
  }

  inviaAnnotazione() {
    if (!this.nuovoTesto.trim()) {
      this.errore = 'Write your annotation first';
      return;
    }

    this.inviando = true;
    this.annotationService.create(this.songId, this.selezione.start, this.selezione.end, this.nuovoTesto).subscribe({
      next: (res) => {
        this.inviando = false;
        this.selezione = null;
        this.aperta = { id: res.id };
        this.messaggio = res.status === 'pending' ? 'Annotation sent! A moderator will review it soon.' : '';
        window.getSelection()?.removeAllRanges();
        this.caricaAnnotazioni();
      },
      error: (err) => {
        this.inviando = false;
        this.errore = err.error.message || 'Error saving the annotation';
      }
    });
  }

  approva(a: any) {
    this.annotationService.approve(a.id).subscribe({
      next: () => { this.messaggio = 'Annotation approved'; this.caricaAnnotazioni(); },
      error: (err) => { this.errore = err.error.message || 'Error approving'; }
    });
  }

  rifiuta(a: any) {
    this.annotationService.reject(a.id).subscribe({
      next: () => { this.aperta = null; this.caricaAnnotazioni(); },
      error: (err) => { this.errore = err.error.message || 'Error rejecting'; }
    });
  }

  async elimina(a: any) {
    const alert = await this.alertC.create({
      header: 'Delete annotation?',
      message: 'The annotation, its votes and its suggestions will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => {
          this.annotationService.delete(a.id).subscribe({
            next: () => { this.chiudi(); this.caricaAnnotazioni(); },
            error: (err) => { this.errore = err.error.message || 'Error deleting the annotation'; }
          });
        } }
      ]
    });
    await alert.present();
  }

  vota(a: any, valore: number) {
    if (!this.mioNome) {
      this.vaiAlLogin();
      return;
    }

    const nuovo = a.my_vote === valore ? 0 : valore;
    this.annotationService.vote(a.id, nuovo).subscribe({
      next: (res) => {
        a.score = res.score;
        a.my_vote = res.my_vote;
      },
      error: (err) => console.error(err)
    });
  }

  getPunteggio(score: number): string {
    if (score > 0) return '+' + score;
    return String(score);
  }

  puoSegnalare(a: any): boolean {
    return a.status === 'approved' && a.username !== this.mioNome;
  }

  apriSegnalazione() {
    if (!this.mioNome) {
      this.vaiAlLogin();
      return;
    }

    this.motivo = '';
    this.erroreSegnalazione = '';
    this.segnalazioneAperta = true;
  }

  chiudiSegnalazione() {
    this.segnalazioneAperta = false;
  }

  scegliMotivo(motivo: string) {
    this.motivo = motivo;
    this.erroreSegnalazione = '';
  }

  onMotivo(event: any) {
    this.motivo = event.detail.value;
    this.erroreSegnalazione = '';
  }

  inviaSegnalazione() {
    if (!this.motivo.trim()) {
      this.erroreSegnalazione = 'Please write the reason of the report';
      return;
    }

    this.segnalando = true;
    this.reportService.reportAnnotation(this.aperta.id, this.motivo).subscribe({
      next: async (res) => {
        this.segnalando = false;
        this.segnalazioneAperta = false;

        const toast = await this.toastC.create({
          message: 'Thanks! Your report has been sent to the moderators.',
          icon: 'checkmark-circle',
          duration: 3000,
          position: 'bottom',
          cssClass: 'dark-toast'
        });
        await toast.present();
      },
      error: (err) => {
        this.segnalando = false;
        this.erroreSegnalazione = err.error.message || 'Error sending the report';
      }
    });
  }

  apriModifica(a: any) {
    if (!this.mioNome) {
      this.vaiAlLogin();
      return;
    }

    this.testoModifica = a.text;
    this.modificaAperta = true;
    this.errore = '';
    this.messaggio = '';
  }

  onTestoModifica(event: any) {
    this.testoModifica = event.detail.value;
    this.errore = '';
  }

  inviaModifica(a: any) {
    this.annotationService.proposeEdit(a.id, this.testoModifica).subscribe({
      next: (res) => {
        this.modificaAperta = false;
        this.messaggio = res.status === 'pending' ? 'Edit sent! A moderator will review it soon.' : 'Annotation updated';
        this.caricaAnnotazioni();
      },
      error: (err) => { this.errore = err.error.message || 'Error sending the edit'; }
    });
  }

  approvaModifica(e: any) {
    this.annotationService.approveEdit(e.id).subscribe({
      next: () => { this.messaggio = 'Edit approved'; this.caricaAnnotazioni(); },
      error: (err) => { this.errore = err.error.message || 'Error approving the edit'; }
    });
  }

  rifiutaModifica(e: any) {
    this.annotationService.rejectEdit(e.id).subscribe({
      next: () => { this.caricaAnnotazioni(); },
      error: (err) => { this.errore = err.error.message || 'Error rejecting the edit'; }
    });
  }
}
