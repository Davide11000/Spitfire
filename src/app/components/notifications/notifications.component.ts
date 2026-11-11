import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonSpinner, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAdd, heart, chatbubble, mail, notificationsOutline, checkmark, close, fileTray, create, chatboxEllipses, language } from 'ionicons/icons';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonIcon, IonSpinner],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @Output() openChat = new EventEmitter<string>();

  public notifications: any[] = [];
  public loading = true;
  public newIds: number[] = [];

  private timer: any = null;

  constructor(private notificationService : Notification, private router : Router) {
    addIcons({ personAdd, heart, chatbubble, mail, notificationsOutline, checkmark, close, fileTray, create, chatboxEllipses, language });
  }

  ngOnInit() {
    this.loadNotifications(true);
    this.timer = setInterval(() => { this.loadNotifications(false); }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  loadNotifications(markAsRead: boolean) {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res;
        this.loading = false;

        let hasUnread = false;
        for (const n of res) {
          if (!n.is_read) {
            hasUnread = true;
            if (!this.newIds.includes(n.id)) this.newIds.push(n.id);
          }
        }

        if (hasUnread && markAsRead) {
          this.notificationService.markAllAsRead().subscribe({
            next: () => { this.notificationService.unread = 0; },
            error: (err) => { console.error('Error marking notifications', err); }
          });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading notifications', err);
      }
    });
  }

  isNew(notification: any): boolean {
    return this.newIds.includes(notification.id);
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getIcon(type: string): string {
    if (type === 'follow') return 'person-add';
    if (type === 'like' || type === 'playlist_like') return 'heart';
    if (type === 'reply') return 'chatbubble';
    if (type === 'request_accepted') return 'checkmark';
    if (type === 'request_rejected') return 'close';
    if (type === 'new_request') return 'file-tray';
    if (type === 'new_correction') return 'create';
    if (type === 'new_translation') return 'language';
    if (type.startsWith('annotation') || type.startsWith('new_annotation')) return 'chatbox-ellipses';
    if (type.startsWith('about') || type.startsWith('new_about')) return 'create';
    return 'mail';
  }

  getMessage(type: string): string {
    if (type === 'follow') return 'started following you';
    if (type === 'like') return 'liked your comment';
    if (type === 'playlist_like') return 'liked your playlist';
    if (type === 'reply') return 'replied to your comment';
    if (type === 'request_accepted') return 'accepted your request';
    if (type === 'request_rejected') return 'rejected your request';
    if (type === 'new_request') return 'sent a new request';
    if (type === 'new_correction') return 'suggested a correction';
    if (type === 'new_translation') return 'sent a translation';
    if (type === 'new_annotation') return 'wrote an annotation to review';
    if (type === 'new_annotation_edit') return 'proposed an edit to an annotation';
    if (type === 'annotation_approved') return 'approved your annotation';
    if (type === 'annotation_rejected') return 'rejected your annotation';
    if (type === 'annotation_edit_approved') return 'approved your edit to an annotation';
    if (type === 'annotation_edit_rejected') return 'rejected your edit to an annotation';
    if (type === 'new_about') return 'wrote a record about to review';
    if (type === 'new_about_edit') return 'proposed an edit to a record about';
    if (type === 'about_approved') return 'approved your record about';
    if (type === 'about_rejected') return 'rejected your record about';
    if (type === 'about_edit_approved') return 'approved your edit to a record about';
    if (type === 'about_edit_rejected') return 'rejected your edit to a record about';
    return 'sent you a message';
  }

  getPreview(notification: any): string {
    if (notification.type === 'message' || notification.type === 'request_accepted' || notification.type === 'request_rejected' || notification.type === 'new_request' || notification.type === 'new_correction' || notification.type === 'new_translation' || notification.annotation_id || notification.type.includes('about')) {
      return notification.text;
    }
    if (notification.type === 'playlist_like') return notification.playlist_name || '';
    return notification.comment_text || '';
  }

  getTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date.replace(' ', 'T') + 'Z').getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
    return Math.floor(seconds / 604800) + 'w';
  }

  goToProfile(event: any, username: string) {
    event.stopPropagation();
    this.router.navigate(['/profile', username]);
  }

  onClick(notification: any) {
    if (notification.type === 'follow') {
      this.router.navigate(['/profile', notification.from_user]);
    }

    if (notification.type === 'message') {
      this.openChat.emit(notification.from_user);
    }

    if (notification.type === 'playlist_like') {
      this.router.navigate(['/playlist', notification.playlist_id]);
    }

    if (notification.type.includes('about') && notification.content_type) {
      this.goToContent(notification.content_type, notification.content_id);
    } else if (notification.type === 'request_accepted' && notification.content_type) {
      this.goToContent(notification.content_type, notification.content_id);
    } else if (notification.type === 'request_accepted' || notification.type === 'request_rejected') {
      this.router.navigate(['/add-content']);
    }

    if (notification.annotation_id && notification.annotation_song_id !== null) {
      this.router.navigate(['/songs', notification.annotation_song_id], { queryParams: { annotation: notification.annotation_id } });
    }

    if (notification.type === 'new_request' || notification.type === 'new_correction' || notification.type === 'new_translation') {
      this.router.navigate(['/requests']);
    }

    if (notification.type === 'like' || notification.type === 'reply') {
      this.goToComment(notification);
    }
  }

  goToContent(type: string, id: number) {
    if (type === 'song') this.router.navigate(['/songs', id]);
    if (type === 'record') this.router.navigate(['/records', id]);
    if (type === 'artist') this.router.navigate(['/artists', id]);
  }

  goToComment(notification: any) {
    if (notification.target_type === 'playlist') this.router.navigate(['/playlist', notification.target_id]);
    if (notification.target_type === 'song') this.router.navigate(['/songs', notification.target_id]);
    if (notification.target_type === 'record') this.router.navigate(['/records', notification.target_id]);
    if (notification.target_type === 'artist') this.router.navigate(['/artists', notification.target_id]);

    if (notification.target_type === 'about' && notification.comment_record_id !== null) {
      this.router.navigate(['/records', notification.comment_record_id]);
    }

    if (notification.target_type === 'annotation' && notification.comment_song_id !== null) {
      this.router.navigate(['/songs', notification.comment_song_id], { queryParams: { annotation: notification.target_id } });
    }
  }

}
