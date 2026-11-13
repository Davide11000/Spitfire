import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flagOutline, trashOutline, checkmarkOutline, checkmarkCircle, shieldCheckmarkOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { Report } from '../../services/report';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, DatePipe, NavbarComponent, FooterComponent]
})
export class ReportsPage implements OnInit {

  public groups: any[] = [];
  public annotationGroups: any[] = [];
  public loading = true;
  public errorMessage = '';

  constructor(private reportService : Report, private router : Router, private alertC : AlertController,
              private toastC : ToastController) {
    addIcons({ flagOutline, trashOutline, checkmarkOutline, checkmarkCircle, shieldCheckmarkOutline });
  }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.loadAnnotationReports();

    this.reportService.getReports().subscribe({
      next: (res) => {
        this.groups = [];

        for (const report of res) {
          let group = this.groups.find(g => g.comment_id === report.comment_id);

          if (!group) {
            group = {
              comment_id: report.comment_id,
              parent_id: report.parent_id,
              text: report.comment_text,
              author: report.comment_author,
              author_photo: report.author_photo,
              date: report.comment_date,
              target_type: report.target_type,
              target_id: report.target_id,
              target_name: report.target_name,
              reports: []
            };
            this.groups.push(group);
          }

          group.reports.push(report);
        }

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Error loading the reports';
        this.loading = false;
      }
    });
  }

  loadAnnotationReports() {
    this.reportService.getAnnotationReports().subscribe({
      next: (res) => {
        this.annotationGroups = [];

        for (const report of res) {
          let group = this.annotationGroups.find(g => g.annotation_id === report.annotation_id);

          if (!group) {
            group = {
              annotation_id: report.annotation_id,
              selected_text: report.selected_text,
              text: report.annotation_text,
              author: report.annotation_author,
              author_photo: report.author_photo,
              date: report.annotation_date,
              song_id: report.song_id,
              songname: report.songname,
              reports: []
            };
            this.annotationGroups.push(group);
          }

          group.reports.push(report);
        }
      },
      error: (err) => { this.errorMessage = err.error.message || 'Error loading the reports'; }
    });
  }

  goToAnnotation(group: any) {
    this.router.navigate(['/songs', group.song_id], { queryParams: { annotation: group.annotation_id } });
  }

  async onAcceptAnnotation(group: any) {
    const alert = await this.alertC.create({
      header: 'Delete annotation?',
      message: 'The annotation by ' + this.getName(group.author) + ', its votes and its suggestions will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => { this.acceptAnnotationReport(group); } }
      ]
    });

    await alert.present();
  }

  acceptAnnotationReport(group: any) {
    group.working = true;
    this.reportService.acceptAnnotationReport(group.reports[0].id).subscribe({
      next: (res) => {
        this.annotationGroups = this.annotationGroups.filter(g => g.annotation_id !== group.annotation_id);
        this.loadReports();
        this.showToast('Annotation deleted');
      },
      error: (err) => { group.working = false; group.error = err.error.message || 'Error deleting the annotation'; }
    });
  }

  onRejectAnnotation(group: any) {
    const requests = [];
    for (const report of group.reports) {
      requests.push(this.reportService.rejectAnnotationReport(report.id));
    }

    forkJoin(requests).subscribe({
      next: (res) => {
        this.annotationGroups = this.annotationGroups.filter(g => g.annotation_id !== group.annotation_id);
        this.showToast('Report rejected, the annotation stays');
      },
      error: (err) => { group.error = err.error.message || 'Error rejecting the report'; }
    });
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getDate(date: string): Date {
    return new Date(date.replace(' ', 'T') + 'Z');
  }

  getTargetLabel(type: string): string {
    if (type === 'song') return 'Song';
    if (type === 'record') return 'Record';
    if (type === 'artist') return 'Artist';
    if (type === 'annotation') return 'Annotation';
    if (type === 'about') return 'About';
    return 'Playlist';
  }

  getName(username: string | null): string {
    if (!username) return 'Deleted user';
    return '@' + username;
  }

  goToProfile(username: string | null) {
    if (!username) return;
    this.router.navigate(['/profile', username]);
  }

  goToTarget(group: any) {
    if (group.target_type === 'playlist') {
      this.router.navigate(['/playlist', group.target_id]);
    }
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

  async onAccept(group: any) {
    const alert = await this.alertC.create({
      header: 'Delete comment?',
      message: 'The comment by ' + this.getName(group.author) + ' and its replies will be deleted.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => { this.acceptReport(group); } }
      ]
    });

    await alert.present();
  }

  acceptReport(group: any) {
    group.working = true;
    this.reportService.acceptReport(group.reports[0].id).subscribe({
      next: (res) => {
        this.groups = this.groups.filter(g => g.comment_id !== group.comment_id && g.parent_id !== group.comment_id);
        this.showToast('Comment deleted');
      },
      error: (err) => { group.working = false; group.error = err.error.message || 'Error deleting the comment'; }
    });
  }

  onReject(group: any) {
    const requests = [];
    for (const report of group.reports) {
      requests.push(this.reportService.rejectReport(report.id));
    }

    forkJoin(requests).subscribe({
      next: (res) => {
        this.groups = this.groups.filter(g => g.comment_id !== group.comment_id);
        this.showToast('Report rejected, the comment stays');
      },
      error: (err) => { group.error = err.error.message || 'Error rejecting the report'; }
    });
  }

}
