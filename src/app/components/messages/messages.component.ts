import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonIcon, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';
import { Message } from '../../services/message';
import { User } from '../../services/user';
import { Auth } from '../../services/auth';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonIcon, IonSearchbar, DatePipe, ChatComponent],
})
export class MessagesComponent implements OnInit, OnDestroy {
  @Input() openWith: string | null = null;

  public myUsername: string | null = null;
  public conversations: any[] = [];
  public selected: string | null = null;

  public searchText = '';
  public searchResults: any[] = [];

  private timer: any = null;

  constructor(private messageService : Message, private userService : User, private auth : Auth) {
    addIcons({ chatbubblesOutline });
  }

  ngOnInit() {
    this.myUsername = this.auth.getUsernameFromToken();
    this.selected = this.openWith;
    this.loadConversations();
    this.timer = setInterval(() => { this.loadConversations(); }, 5000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  loadConversations() {
    this.messageService.getConversations().subscribe({
      next: (res) => {
        this.conversations = res;

        for (const c of this.conversations) {
          if (c.other_user === this.selected) c.unread = 0;
        }
      },
      error: (err) => { console.error('Error loading conversations', err); }
    });
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getDate(date: string): Date {
    return new Date(date.replace(' ', 'T') + 'Z');
  }

  isToday(date: string): boolean {
    return this.getDate(date).toDateString() === new Date().toDateString();
  }

  openChat(username: string) {
    this.selected = username;
    this.closeSearch();

    const conversation = this.conversations.find(c => c.other_user === username);
    if (conversation) conversation.unread = 0;
  }

  closeChat() {
    this.selected = null;
  }

  onSearch(event: any) {
    this.searchText = event.detail.value;

    if (!this.searchText) {
      this.searchResults = [];
      return;
    }

    this.userService.search(this.searchText).subscribe({
      next: (res) => { this.searchResults = res.filter((u: any) => u.username !== this.myUsername); },
      error: (err) => { console.error('Error searching users', err); }
    });
  }

  closeSearch() {
    this.searchText = '';
    this.searchResults = [];
  }

}
