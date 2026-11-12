import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';

import { IonContent, IonSpinner, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonText, IonInput, IonTextarea } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, lockClosedOutline, closeOutline, logOutOutline, imageOutline, trashOutline, globeOutline, cameraOutline, chatbubbleOutline, settingsOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Follow } from '../../services/follow';
import { User } from '../../services/user';
import { Playlist } from '../../services/playlist';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ChatComponent } from '../../components/chat/chat.component';
import { MessagesComponent } from '../../components/messages/messages.component';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { isLightColor } from '../../constants/profile-colors';
import { UserRatingsComponent } from '../../components/user-ratings/user-ratings.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonSpinner, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonText, NavbarComponent, IonInput, IonTextarea, ChatComponent, MessagesComponent, NotificationsComponent, UserRatingsComponent]
})
export class ProfilePage implements OnInit {

  public user : any = null;
  public isOwnProfile : boolean = false;
  public targetUsername: string | null = null;
  public errorMessage = '';
  public photoError = '';
  public followError = '';

  public followers: any[] = [];
  public following: any[] = [];
  public isFollowing: boolean = false;

  public playlists: any[] = [];

  public isCreateOpen = false;
  public newPlaylistName = '';
  public newPlaylistPublic = true;
  public newPlaylistDescription = '';
  public newPlaylistImage: File | null = null;
  public newPlaylistPreview = '';
  public createError = '';
  public creating = false;
  public uploadingPhoto = false;
  private playlistToOpen: number | null = null;

  public favouriteSongs: any[] = [];
  public favouriteRecords: any[] = [];
  public favouriteArtists: any[] = [];

  public isModalOpen = false;
  public modalTitle = '';
  public modalUsers: any[] = [];
  private profileToOpen: string | null = null;

  public isChatOpen = false;
  public isActive = true;

  @ViewChild(MessagesComponent) messagesComponent!: MessagesComponent;

  constructor(private auth : Auth, private router : Router, private route : ActivatedRoute, private follow : Follow,
              private userService : User, private pl : Playlist) {
    addIcons({ addOutline, lockClosedOutline, closeOutline, logOutOutline, imageOutline, trashOutline, globeOutline, cameraOutline, chatbubbleOutline, settingsOutline });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const myUsername = this.auth.getUsernameFromToken();

      this.targetUsername = params.get("username");

      if (!this.targetUsername) {
        this.targetUsername = myUsername;
      }

      if (!this.targetUsername) {
        this.router.navigate(['/login']);
        return;
      }

      this.isOwnProfile = myUsername === this.targetUsername;
      this.loadProfile(this.targetUsername, myUsername);
    });
  }

  ionViewWillEnter() {
    this.isActive = true;

    if (this.targetUsername) {
      this.loadPlaylists(this.targetUsername);
      this.loadFavourites(this.targetUsername);

      this.userService.getUser(this.targetUsername).subscribe({
        next: (res) => { this.user = res; },
        error: (err) => { console.error('Error fetching user', err); }
      });
    }
  }

  ionViewWillLeave() {
    this.isActive = false;
    this.isChatOpen = false;
  }

  loadPlaylists(username: string) {
    this.pl.getUserPlaylists(username).subscribe({
      next: (res) => { this.playlists = res; },
      error: (err) => { console.error('Error fetching playlists', err); }
    });
  }

  loadFavourites(username: string) {
    this.userService.getFavouriteSongs(username).subscribe({
      next: (res) => { this.favouriteSongs = res; },
      error: (err) => { console.error('Error fetching favourite songs', err); }
    });

    this.userService.getFavouriteRecords(username).subscribe({
      next: (res) => { this.favouriteRecords = res; },
      error: (err) => { console.error('Error fetching favourite albums', err); }
    });

    this.userService.getFavouriteArtists(username).subscribe({
      next: (res) => { this.favouriteArtists = res; },
      error: (err) => { console.error('Error fetching favourite artists', err); }
    });
  }

  goToSong(id: number) {
    this.router.navigate(['/songs', id]);
  }

  goToAlbum(id: number) {
    this.router.navigate(['/records', id]);
  }

  goToArtist(id: number) {
    this.router.navigate(['/artists', id]);
  }

  loadProfile(username: string, myUsername: string | null) {
    this.user = null;
    this.errorMessage = '';

    this.userService.getUser(username).subscribe({
      next: (res) => { this.user = res; },
      error: (err) => {
        if (username === myUsername) {
          this.auth.logout();
          this.router.navigate(['/login']);
          return;
        }
        this.errorMessage = 'User not found';
      }
    });

    this.follow.getFollowers(username).subscribe({
      next: (res) => {
        this.followers = res;
        this.isFollowing = res.some((f: any) => f.follower === myUsername);
      },
      error: (err) => { console.error('Error fetching followers', err); }
    });

    this.follow.getFollowing(username).subscribe({
      next: (res) => { this.following = res; },
      error: (err) => { console.error('Error fetching following', err); }
    });

    this.loadPlaylists(username);

    this.loadFavourites(username);
  }

  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getCover(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  getSongCover(song: any): string {
    if (song.image) return this.getCover(song.image);
    return this.getCover(song.recordimage);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onFollow() {
    if (!this.targetUsername) return;
    this.followError = '';

    const myUsername = this.auth.getUsernameFromToken();
    if (!myUsername) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isFollowing){
      this.follow.unfollowUser(this.targetUsername).subscribe({
        next: (res) => {
          this.isFollowing = false;
          this.followers = this.followers.filter(f => f.follower !== myUsername);
        },
        error: (err) => {
          this.followError = err.error.message || 'Error unfollowing user';
        }
      });
    } else {
      this.follow.followUser(this.targetUsername).subscribe({
        next: (res) => {
          this.isFollowing = true;
          this.followers.push({ follower: myUsername, following: this.targetUsername });
        },
        error: (err) => {
          this.followError = err.error.message || 'Error following user';
        }
      });
    }
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  canMessage(): boolean {
    if (this.user.who_can_message === 'nobody') return false;
    if (this.user.who_can_message === 'everyone') return true;

    const myUsername = this.auth.getUsernameFromToken();
    return this.following.some(f => f.following === myUsername);
  }

  openChat() {
    if (!this.auth.getUsernameFromToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isChatOpen = true;
  }

  openChatFromNotification(username: string, messagesBox: HTMLElement) {
    this.messagesComponent.openChat(username);
    messagesBox.scrollIntoView({ behavior: 'smooth' });
  }

  openFollowers() {
    this.modalTitle = 'Followers';
    this.modalUsers = [];

    for (const f of this.followers) {
      this.modalUsers.push({ username: f.follower, foto_profilo: f.foto_profilo });
    }

    this.isModalOpen = true;
  }

  openFollowing() {
    this.modalTitle = 'Following';
    this.modalUsers = [];

    for (const f of this.following) {
      this.modalUsers.push({ username: f.following, foto_profilo: f.foto_profilo });
    }

    this.isModalOpen = true;
  }

  goToProfile(username: string) {
    this.profileToOpen = username;
    this.isModalOpen = false;
  }

  onModalClosed() {
    this.isModalOpen = false;

    if (this.profileToOpen) {
      const username = this.profileToOpen;
      this.profileToOpen = null;
      this.router.navigate(['/profile', username]);
    }
  }

  openPlaylist(playlist: any) {
    this.router.navigate(['/playlist', playlist.id]);
  }

  onCreatePlaylist() {
    this.newPlaylistName = '';
    this.newPlaylistPublic = true;
    this.newPlaylistDescription = '';
    this.newPlaylistImage = null;
    this.newPlaylistPreview = '';
    this.createError = '';
    this.isCreateOpen = true;
  }

  onCreateClosed() {
    this.isCreateOpen = false;

    if (this.playlistToOpen) {
      const id = this.playlistToOpen;
      this.playlistToOpen = null;
      this.router.navigate(['/playlist', id]);
    }
  }

  onCoverSelected(event: any) {
    this.createError = '';
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.createError = 'The image must be smaller than 5 MB';
      return;
    }

    this.newPlaylistImage = file;
    this.newPlaylistPreview = URL.createObjectURL(file);
  }

  removeCover() {
    this.newPlaylistImage = null;
    this.newPlaylistPreview = '';
  }

  onDescriptionInput(event: any) {
    this.newPlaylistDescription = event.detail.value;
  }

  onNameInput(event: any) {
    this.newPlaylistName = event.detail.value;
    this.createError = '';
  }

  createPlaylist() {
    this.createError = '';

    if (!this.newPlaylistName) {
      this.createError = 'Please write a name for the playlist';
      return;
    }

    this.creating = true;
    this.pl.createPlaylist(this.newPlaylistName, this.newPlaylistPublic, this.newPlaylistImage, this.newPlaylistDescription).subscribe({
      next: (res) => {
        this.creating = false;
        this.playlists.push(res);
        this.playlistToOpen = res.id;
        this.isCreateOpen = false;
      },
      error: (err) => {
        this.creating = false;
        this.createError = err.error.message || 'Error creating the playlist';
      }
    });
  }

  onPhotoSelected(event: any) {
    this.photoError = '';
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.photoError = 'The image must be smaller than 5 MB';
      return;
    }

    this.uploadingPhoto = true;
    this.userService.uploadPhoto(file).subscribe({
      next: (res) => {
        this.user.foto_profilo = res.foto_profilo;
        this.uploadingPhoto = false;
      },
      error: (err) => {
        this.photoError = err.error.message || 'Error uploading photo';
        this.uploadingPhoto = false;
      }
    });
  }

  onRemovePhoto() {
    this.photoError = '';

    this.userService.removePhoto().subscribe({
      next: (res) => { this.user.foto_profilo = null; },
      error: (err) => { this.photoError = err.error.message || 'Error removing photo'; }
    });
  }

  hasDarkColor(): boolean {
    return !!this.user?.profile_color && !isLightColor(this.user.profile_color);
  }
}
