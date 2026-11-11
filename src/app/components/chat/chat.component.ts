import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonTextarea, IonSpinner, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sendOutline, closeOutline, chevronBackOutline, chatbubblesOutline, banOutline } from 'ionicons/icons';
import { Message } from '../../services/message';
import { User } from '../../services/user';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonIcon, IonTextarea, IonSpinner, DatePipe],
})
export class ChatComponent implements OnChanges, OnDestroy {
  @Input() username!: string;
  @Input() closable = false;
  @Input() backButton = false;

  @Output() closed = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() sent = new EventEmitter<any>();

  @ViewChild('scrollBox') scrollBox!: ElementRef;

  public myUsername: string | null = null;
  public photo: string | null = null;
  public messages: any[] = [];
  public loading = false;
  public newText = '';
  public sending = false;
  public error = '';
  public blocked = false;

  private timer: any = null;

  constructor(private messageService : Message, private userService : User, private auth : Auth, private router : Router,
              private alertC : AlertController) {
    addIcons({ sendOutline, closeOutline, chevronBackOutline, chatbubblesOutline, banOutline });
  }

  ngOnChanges() {
    this.myUsername = this.auth.getUsernameFromToken();
    this.messages = [];
    this.newText = '';
    this.error = '';
    this.photo = null;
    this.blocked = false;
    this.stopTimer();

    if (!this.username) return;

    this.messageService.isBlocked(this.username).subscribe({
      next: (res) => { this.blocked = res.blocked; },
      error: (err) => { console.error('Error checking the block', err); }
    });

    this.userService.getUser(this.username).subscribe({
      next: (res) => { this.photo = res.foto_profilo; },
      error: (err) => { console.error('Error fetching user', err); }
    });

    this.loading = true;
    this.messageService.getChat(this.username).subscribe({
      next: (res) => {
        this.messages = res;
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error.message || 'Error loading the chat';
      }
    });

    this.timer = setInterval(() => { this.loadNewMessages(); }, 3000);
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  loadNewMessages() {
    let lastId = 0;
    if (this.messages.length > 0) {
      lastId = this.messages[this.messages.length - 1].id;
    }

    this.messageService.getChat(this.username, lastId).subscribe({
      next: (res) => {
        if (res.length > 0) {
          this.addMessages(res);
          this.scrollToBottom();
        }
      },
      error: (err) => { console.error('Error loading new messages', err); }
    });
  }

  addMessages(list: any[]) {
    for (const message of list) {
      if (!this.messages.some(m => m.id === message.id)) {
        this.messages.push(message);
      }
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollBox) {
        this.scrollBox.nativeElement.scrollTop = this.scrollBox.nativeElement.scrollHeight;
      }
    });
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getDate(date: string): Date {
    return new Date(date.replace(' ', 'T') + 'Z');
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;

    const day = this.getDate(this.messages[index].created_at).toDateString();
    const previousDay = this.getDate(this.messages[index - 1].created_at).toDateString();
    return day !== previousDay;
  }

  getDayLabel(date: string): string {
    const day = this.getDate(date).toDateString();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (day === today.toDateString()) return 'Today';
    if (day === yesterday.toDateString()) return 'Yesterday';
    return '';
  }

  goToProfile() {
    this.closed.emit();
    this.router.navigate(['/profile', this.username]);
  }

  onTextInput(event: any) {
    this.newText = event.detail.value;
    this.error = '';
  }

  onKeyDown(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.newText.trim() || this.sending) return;

    this.sending = true;
    this.messageService.sendMessage(this.username, this.newText).subscribe({
      next: (res) => {
        this.sending = false;
        this.newText = '';
        this.addMessages([res]);
        this.scrollToBottom();
        this.sent.emit(res);
      },
      error: (err) => {
        this.sending = false;
        this.error = err.error.message || 'Error sending the message';
      }
    });
  }

  async toggleBlock() {
    if (this.blocked) {
      this.messageService.unblock(this.username).subscribe({
        next: () => { this.blocked = false; },
        error: (err) => { this.error = err.error.message || 'Error unblocking the user'; }
      });
      return;
    }

    const alert = await this.alertC.create({
      header: 'Block @' + this.username + '?',
      message: "You won't receive their messages anymore. They won't know you blocked them.",
      cssClass: 'dark-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Block', role: 'destructive', handler: () => {
          this.messageService.block(this.username).subscribe({
            next: () => { this.blocked = true; },
            error: (err) => { this.error = err.error.message || 'Error blocking the user'; }
          });
        } }
      ]
    });
    await alert.present();
  }
}
