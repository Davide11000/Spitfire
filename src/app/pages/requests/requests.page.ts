import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner, IonSegment, IonSegmentButton, IonLabel, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fileTrayFullOutline, checkmarkOutline, closeOutline, checkmarkCircle, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { Request } from '../../services/request';
import { RoleRequest } from '../../services/role-request';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, IonSegment, IonSegmentButton, IonLabel, DatePipe, NavbarComponent, FooterComponent]
})
export class RequestsPage implements OnInit {

  public requests: any[] = [];
  public roleRequests: any[] = [];
  public loading = true;
  public errorMessage = '';
  public filter = 'all';

  constructor(private requestService : Request, private roleRequestService : RoleRequest, private router : Router, private alertC : AlertController,
              private toastC : ToastController) {
    addIcons({ fileTrayFullOutline, checkmarkOutline, closeOutline, checkmarkCircle, chevronDownOutline, chevronUpOutline });
  }

  ngOnInit() {
    this.requestService.getPendingRequests().subscribe({
      next: (res) => {
        this.requests = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Error loading the requests';
        this.loading = false;
      }
    });

    this.roleRequestService.getPending().subscribe({
      next: (res) => { this.roleRequests = res; },
      error: (err) => { console.error('Error loading the moderator requests', err); }
    });
  }

  onFilterChange(event: any) {
    this.filter = event.detail.value;
  }

  getFiltered(): any[] {
    if (this.filter === 'all') return this.requests;
    return this.requests.filter(r => r.type === this.filter);
  }

  countType(type: string): number {
    return this.requests.filter(r => r.type === type).length;
  }

  getTypeLabel(type: string): string {
    if (type === 'song') return 'Song';
    if (type === 'record') return 'Record';
    if (type === 'translation') return 'Translation';
    return 'Artist';
  }

  getImage(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getDate(date: string): Date {
    return new Date(date.replace(' ', 'T') + 'Z');
  }

  getGenres(request: any): string[] {
    if (!request.genres) return [];
    return request.genres.split(', ');
  }

  getTracks(request: any): string[] {
    if (!request.tracklist) return [];
    return request.tracklist.split('\n');
  }

  toggleLyrics(request: any) {
    request.showLyrics = !request.showLyrics;
  }

  goToProfile(username: string) {
    this.router.navigate(['/profile', username]);
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

  onAccept(request: any) {
    request.error = '';
    request.working = true;

    this.requestService.acceptRequest(request.id).subscribe({
      next: (res) => {
        this.requests = this.requests.filter(r => r.id !== request.id);
        this.showToast('"' + request.name + '" has been ' + (request.target_id !== null ? 'updated' : 'added'));
      },
      error: (err) => {
        request.working = false;
        request.error = err.error.message || 'Error accepting the request';
      }
    });
  }

  async onReject(request: any) {
    const alert = await this.alertC.create({
      header: 'Reject request?',
      message: '"' + request.name + '" will not be added.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Reject', role: 'destructive', handler: () => { this.rejectRequest(request); } }
      ]
    });

    await alert.present();
  }

  rejectRequest(request: any) {
    request.error = '';

    this.requestService.rejectRequest(request.id).subscribe({
      next: (res) => {
        this.requests = this.requests.filter(r => r.id !== request.id);
        this.showToast('Request rejected');
      },
      error: (err) => { request.error = err.error.message || 'Error rejecting the request'; }
    });
  }

  isLink(source: string): boolean {
    return /^https?:\/\//i.test(source);
  }

  onAcceptRole(request: any) {
    request.error = '';
    request.working = true;

    this.roleRequestService.accept(request.id).subscribe({
      next: (res) => {
        this.roleRequests = this.roleRequests.filter(r => r.id !== request.id);
        this.showToast('@' + request.username + ' is now a moderator');
      },
      error: (err) => {
        request.working = false;
        request.error = err.error.message || 'Error accepting the request';
      }
    });
  }

  async onRejectRole(request: any) {
    const alert = await this.alertC.create({
      header: 'Reject request?',
      message: '@' + request.username + ' will not become a moderator.',
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Reject', role: 'destructive', handler: () => { this.rejectRole(request); } }
      ]
    });

    await alert.present();
  }

  rejectRole(request: any) {
    request.error = '';

    this.roleRequestService.reject(request.id).subscribe({
      next: (res) => {
        this.roleRequests = this.roleRequests.filter(r => r.id !== request.id);
        this.showToast('Request rejected');
      },
      error: (err) => { request.error = err.error.message || 'Error rejecting the request'; }
    });
  }
}
