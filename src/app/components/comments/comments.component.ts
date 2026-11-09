import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonTextarea, IonSpinner, IonModal, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, chatbubbleOutline, trashOutline, chevronDownOutline, chevronUpOutline, chevronBackOutline, chevronForwardOutline, flagOutline, closeOutline, checkmarkCircle } from 'ionicons/icons';
import { Comment } from '../../services/comment';
import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { Report } from '../../services/report';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonIcon, IonTextarea, IonSpinner, IonModal, DatePipe],
})
export class CommentsComponent implements OnChanges {
  @Input() type!: string;
  @Input() id!: number | string;
  @Input() title = 'Comments';

  public myUsername: string | null = null;
  public canModerate = false;

  public comments: any[] = [];
  public total = 0;
  public page = 1;
  public pages: number[] = [];
  public loading = false;

  public newText = '';
  public posting = false;
  public error = '';

  public isReportOpen = false;
  public reportedComment: any = null;
  public reportReason = '';
  public reportError = '';
  public reporting = false;
  public reasons = ['Spam', 'Offensive language', 'Harassment', 'Spoiler', 'Off topic'];

  constructor(private commentService : Comment, private auth : Auth, private userService : User,
              private reportService : Report, private router : Router, private alertC : AlertController,
              private toastC : ToastController) {
    addIcons({ thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, chatbubbleOutline, trashOutline, chevronDownOutline, chevronUpOutline, chevronBackOutline, chevronForwardOutline, flagOutline, closeOutline, checkmarkCircle });
  }

  ngOnChanges() {
    this.myUsername = this.auth.getUsernameFromToken();
    this.canModerate = false;

    if (this.myUsername) {
      this.userService.getUserRole(this.myUsername).subscribe({
        next: (res) => { this.canModerate = res.ruolo === 'admin' || res.ruolo === 'moderatore'; },
        error: (err) => { console.error('Error fetching role', err); }
      });
    }

    if (this.type && this.id) {
      this.loadComments(1);
    }
  }

  loadComments(page: number) {
    this.loading = true;

    this.commentService.getComments(this.type, Number(this.id), page).subscribe({
      next: (res) => {
        this.comments = res.comments;
        this.total = res.total;
        this.page = res.page;

        this.pages = [];
        for (let i = 1; i <= res.totalPages; i++) {
          this.pages.push(i);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching comments', err);
        this.loading = false;
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.pages.length || page === this.page) return;
    this.loadComments(page);
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getDate(date: string): Date {
    return new Date(date.replace(' ', 'T') + 'Z');
  }

  getName(username: string | null): string {
    if (!username) return 'Deleted user';
    return '@' + username;
  }

  goToProfile(username: string | null) {
    if (!username) return;
    this.router.navigate(['/profile', username]);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  canDelete(comment: any): boolean {
    return comment.username === this.myUsername || this.canModerate;
  }

  canReport(comment: any): boolean {
    return comment.username !== this.myUsername;
  }

  onTextInput(event: any) {
    this.newText = event.detail.value;
    this.error = '';
  }

  postComment() {
    if (!this.newText.trim()) return;

    this.posting = true;
    this.commentService.createComment(this.type, Number(this.id), this.newText).subscribe({
      next: (res) => {
        this.posting = false;
        this.newText = '';
        this.loadComments(1);
      },
      error: (err) => {
        this.posting = false;
        this.error = err.error.message || 'Error posting the comment';
      }
    });
  }

  toggleReplies(comment: any) {
    if (comment.showReplies) {
      comment.showReplies = false;
      return;
    }

    this.commentService.getReplies(comment.id).subscribe({
      next: (res) => {
        comment.repliesList = res;
        comment.showReplies = true;
      },
      error: (err) => { console.error('Error fetching replies', err); }
    });
  }

  toggleReplyBox(comment: any) {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    comment.showReplyBox = !comment.showReplyBox;
    comment.replyText = '';
  }

  onReplyInput(comment: any, event: any) {
    comment.replyText = event.detail.value;
  }

  postReply(comment: any) {
    if (!comment.replyText || !comment.replyText.trim()) return;

    this.commentService.createComment(this.type, Number(this.id), comment.replyText, comment.id).subscribe({
      next: (res) => {
        comment.replies++;
        comment.showReplyBox = false;
        comment.replyText = '';

        if (comment.showReplies) {
          comment.repliesList.push(res);
        } else {
          this.toggleReplies(comment);
        }
      },
      error: (err) => { this.error = err.error.message || 'Error posting the reply'; }
    });
  }

  // Mi piace = +1, non mi piace = -1; cliccando di nuovo lo stesso voto lo tolgo
  vote(comment: any, value: number) {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    const newValue = comment.my_vote === value ? 0 : value;
    this.commentService.vote(comment.id, newValue).subscribe({
      next: (res) => {
        comment.score = res.score;
        comment.my_vote = res.my_vote;
      },
      error: (err) => { console.error('Error voting the comment', err); }
    });
  }

  getScore(score: number): string {
    if (score > 0) return '+' + score;
    return String(score);
  }

  async onDelete(comment: any, parent: any) {
    const alert = await this.alertC.create({
      header: 'Delete comment?',
      message: parent ? 'The reply will be deleted.' : 'The comment and its replies will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => { this.deleteComment(comment, parent); } }
      ]
    });

    await alert.present();
  }

  deleteComment(comment: any, parent: any) {
    this.commentService.deleteComment(comment.id).subscribe({
      next: (res) => {
        if (parent) {
          parent.repliesList = parent.repliesList.filter((r: any) => r.id !== comment.id);
          parent.replies--;
        } else if (this.comments.length === 1 && this.page > 1) {
          this.loadComments(this.page - 1);
        } else {
          this.loadComments(this.page);
        }
      },
      error: (err) => { this.error = err.error.message || 'Error deleting the comment'; }
    });
  }

  openReport(comment: any) {
    if (!this.myUsername) {
      this.goToLogin();
      return;
    }

    this.reportedComment = comment;
    this.reportReason = '';
    this.reportError = '';
    this.isReportOpen = true;
  }

  closeReport() {
    this.isReportOpen = false;
  }

  chooseReason(reason: string) {
    this.reportReason = reason;
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
    this.reportService.reportComment(this.reportedComment.id, this.reportReason).subscribe({
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

}
