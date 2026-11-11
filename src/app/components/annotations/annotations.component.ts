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

  public lyricsText = '';
  public annotations: any[] = [];
  public segments: any[] = [];

  public myUsername: string | null = null;
  public canModerate = false;

  public selection: any = null;
  public activeAnnotation: any = null;
  public newText = '';
  public editOpen = false;
  public editText = '';
  public errorMessage = '';
  public infoMessage = '';
  public sending = false;

  public isReportOpen = false;
  public reportReason = '';
  public reportError = '';
  public reporting = false;
  public reasons = ['Wrong meaning', 'Spam', 'Offensive language', 'Copied from elsewhere', 'Off topic'];

  constructor(private annotationService : Annotation, private auth : Auth, private userService : User, private router : Router,
              private alertC : AlertController, private reportService : Report, private toastC : ToastController) {
    addIcons({ thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, closeOutline, createOutline, checkmarkOutline, trashOutline, flagOutline, checkmarkCircle });
  }

  ngOnChanges() {
    this.lyricsText = (this.lyrics || '').replace(/\r\n/g, '\n');
    this.myUsername = this.auth.getUsernameFromToken();
    this.canModerate = false;

    if (this.myUsername) {
      this.userService.getUserRole(this.myUsername).subscribe({
        next: (res) => { this.canModerate = res.ruolo === 'admin' || res.ruolo === 'moderatore'; },
        error: (err) => console.error(err)
      });
    }

    this.loadAnnotations();
  }

  loadAnnotations() {
    if (!this.songId) return;

    this.annotationService.getBySong(this.songId).subscribe({
      next: (res) => {
        this.annotations = res;
        this.buildSegments();

        const toOpen = this.activeAnnotation ? this.activeAnnotation.id : this.openId;
        if (toOpen) {
          const a = this.annotations.find(x => x.id === Number(toOpen));
          if (a) this.activeAnnotation = a;
        }
      },
      error: (err) => console.error(err)
    });
  }

  buildSegments() {
    this.segments = [];
    let position = 0;

    const valid = this.annotations
      .filter(a => this.lyricsText.substring(a.start_index, a.end_index) === a.selected_text)
      .sort((a, b) => a.start_index - b.start_index);

    for (const a of valid) {
      if (a.start_index < position) continue;
      if (a.start_index > position) {
        this.segments.push({ lyricsText: this.lyricsText.substring(position, a.start_index), annotation: null });
      }
      this.segments.push({ lyricsText: a.selected_text, annotation: a });
      position = a.end_index;
    }

    if (position < this.lyricsText.length) {
      this.segments.push({ lyricsText: this.lyricsText.substring(position), annotation: null });
    }
  }

  onSelection(box: HTMLElement) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!box.contains(range.startContainer) || !box.contains(range.endContainer)) return;

    const before = document.createRange();
    before.selectNodeContents(box);
    before.setEnd(range.startContainer, range.startOffset);

    let start = before.toString().length;
    let end = start + range.toString().length;

    while (start < end && /\s/.test(this.lyricsText[start])) start++;
    while (end > start && /\s/.test(this.lyricsText[end - 1])) end--;
    if (start >= end) return;

    this.selection = { start, end, lyricsText: this.lyricsText.substring(start, end) };
    this.activeAnnotation = null;
    this.newText = '';
    this.errorMessage = '';
    this.infoMessage = '';
  }

  openAnnotation(a: any) {
    this.activeAnnotation = a;
    this.selection = null;
    this.editOpen = false;
    this.errorMessage = '';
    this.infoMessage = '';
  }

  close() {
    this.activeAnnotation = null;
    this.selection = null;
    this.editOpen = false;
    this.errorMessage = '';
    this.infoMessage = '';
    window.getSelection()?.removeAllRanges();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToProfile(username: string | null) {
    if (username) this.router.navigate(['/profile', username]);
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  onNewTextInput(event: any) {
    this.newText = event.detail.value;
    this.errorMessage = '';
  }

  sendAnnotation() {
    if (!this.newText.trim()) {
      this.errorMessage = 'Write your annotation first';
      return;
    }

    this.sending = true;
    this.annotationService.create(this.songId, this.selection.start, this.selection.end, this.newText).subscribe({
      next: (res) => {
        this.sending = false;
        this.selection = null;
        this.activeAnnotation = { id: res.id };
        this.infoMessage = res.status === 'pending' ? 'Annotation sent! A moderator will review it soon.' : '';
        window.getSelection()?.removeAllRanges();
        this.loadAnnotations();
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error.message || 'Error saving the annotation';
      }
    });
  }

  approve(a: any) {
    this.annotationService.approve(a.id).subscribe({
      next: () => { this.infoMessage = 'Annotation approved'; this.loadAnnotations(); },
      error: (err) => { this.errorMessage = err.error.message || 'Error approving'; }
    });
  }

  reject(a: any) {
    this.annotationService.reject(a.id).subscribe({
      next: () => { this.activeAnnotation = null; this.loadAnnotations(); },
      error: (err) => { this.errorMessage = err.error.message || 'Error rejecting'; }
    });
  }

  async onDelete(a: any) {
    const alert = await this.alertC.create({
      header: 'Delete annotation?',
      message: 'The annotation, its votes and its suggestions will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => {
          this.annotationService.delete(a.id).subscribe({
            next: () => { this.close(); this.loadAnnotations(); },
            error: (err) => { this.errorMessage = err.error.message || 'Error deleting the annotation'; }
          });
        } }
      ]
    });
    await alert.present();
  }

  vote(a: any, value: number) {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    const newValue = a.my_vote === value ? 0 : value;
    this.annotationService.vote(a.id, newValue).subscribe({
      next: (res) => {
        a.score = res.score;
        a.my_vote = res.my_vote;
      },
      error: (err) => console.error(err)
    });
  }

  getScore(score: number): string {
    if (score > 0) return '+' + score;
    return String(score);
  }

  canReport(a: any): boolean {
    return a.status === 'approved' && a.username !== this.myUsername;
  }

  openReport() {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    this.reportReason = '';
    this.reportError = '';
    this.isReportOpen = true;
  }

  closeReport() {
    this.isReportOpen = false;
  }

  chooseReason(reportReason: string) {
    this.reportReason = reportReason;
    this.reportError = '';
  }

  onReasonInput(event: any) {
    this.reportReason = event.detail.value;
    this.reportError = '';
  }

  sendReport() {
    if (!this.reportReason.trim()) {
      this.reportError = 'Please write the reason of the report';
      return;
    }

    this.reporting = true;
    this.reportService.reportAnnotation(this.activeAnnotation.id, this.reportReason).subscribe({
      next: async (res) => {
        this.reporting = false;
        this.isReportOpen = false;

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
        this.reporting = false;
        this.reportError = err.error.message || 'Error sending the report';
      }
    });
  }

  openEdit(a: any) {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    this.editText = a.text;
    this.editOpen = true;
    this.errorMessage = '';
    this.infoMessage = '';
  }

  onEditTextInput(event: any) {
    this.editText = event.detail.value;
    this.errorMessage = '';
  }

  sendEdit(a: any) {
    this.annotationService.proposeEdit(a.id, this.editText).subscribe({
      next: (res) => {
        this.editOpen = false;
        this.infoMessage = res.status === 'pending' ? 'Edit sent! A moderator will review it soon.' : 'Annotation updated';
        this.loadAnnotations();
      },
      error: (err) => { this.errorMessage = err.error.message || 'Error sending the edit'; }
    });
  }

  approveEdit(e: any) {
    this.annotationService.approveEdit(e.id).subscribe({
      next: () => { this.infoMessage = 'Edit approved'; this.loadAnnotations(); },
      error: (err) => { this.errorMessage = err.error.message || 'Error approving the edit'; }
    });
  }

  rejectEdit(e: any) {
    this.annotationService.rejectEdit(e.id).subscribe({
      next: () => { this.loadAnnotations(); },
      error: (err) => { this.errorMessage = err.error.message || 'Error rejecting the edit'; }
    });
  }
}
