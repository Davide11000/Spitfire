import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { IonContent, IonSpinner, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonText, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, lockClosedOutline, closeOutline, logOutOutline, imageOutline, trashOutline } from 'ionicons/icons';
import { Auth } from 'src/app/services/auth';
import { Follow } from 'src/app/services/follow';
import { User } from 'src/app/services/user';
import { Playlist } from 'src/app/services/playlist';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonSpinner, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonText]
})
export class ProfilePage implements OnInit {

  public user : any = null; //Salvo in questa variabile i dati dell'utente
  public isOwnProfile : boolean = false;
  public targetUsername: string | null = null;
  public errorMessage = '';
  public photoError = '';

  public followers: any[] = [];
  public following: any[] = [];
  public isFollowing: boolean = false;

  public playlists: any[] = [];

  // Modal con la lista di follower / following
  public isModalOpen = false;
  public modalTitle = '';
  public modalUsers: any[] = [];

  constructor(private auth : Auth, private router : Router, private route : ActivatedRoute, private follow : Follow,
              private userService : User, private pl : Playlist, private alertC : AlertController) {
    addIcons({ addOutline, lockClosedOutline, closeOutline, logOutOutline, imageOutline, trashOutline });
  }

  ngOnInit() {
    // Uso subscribe perché passando da un profilo all'altro la pagina non viene ricreata, cambia solo il parametro
    this.route.paramMap.subscribe(params => {
      const myUsername = this.auth.getUsernameFromToken();

      this.targetUsername = params.get("username");

      // Se l'URL è solo /profile apro il mio profilo
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

  loadProfile(username: string, myUsername: string | null) {
    this.user = null;
    this.errorMessage = '';

    this.userService.getUser(username).subscribe({
      next: (res) => { this.user = res; },
      error: (err) => { this.errorMessage = 'User not found'; }
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

    this.pl.getUserPlaylists(username).subscribe({
      next: (res) => { this.playlists = res; },
      error: (err) => { console.error('Error fetching playlists', err); }
    });
  }

  // Se l'immagine non c'è uso quella di default
  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getCover(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onFollow() {
    if (!this.targetUsername) return;

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
          console.error('Error unfollowing user', err);
        }
      });
    } else {
      this.follow.followUser(this.targetUsername).subscribe({
        next: (res) => {
          this.isFollowing = true;
          this.followers.push({ follower: myUsername, following: this.targetUsername });
        },
        error: (err) => {
          console.error('Error following user', err);
        }
      });
    }
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
    this.isModalOpen = false;
    this.router.navigate(['/profile', username]);
  }

  openPlaylist(playlist: any) {
    this.router.navigate(['/playlist', playlist.id]);
  }

  async onCreatePlaylist() {
    const alert = await this.alertC.create({
      header: 'New playlist',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Playlist name' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data) => {
            if (!data.name) return false;

            this.pl.createPlaylist(data.name).subscribe({
              next: (res) => { this.playlists.push(res); },
              error: (err) => { console.error('Error creating playlist', err); }
            });
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  onPhotoSelected(event: any) {
    this.photoError = '';
    const file = event.target.files[0];
    event.target.value = ''; // svuoto l'input, così si può riscegliere lo stesso file
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.photoError = 'The image must be smaller than 5 MB';
      return;
    }

    this.userService.uploadPhoto(file).subscribe({
      next: (res) => { this.user.foto_profilo = res.foto_profilo; },
      error: (err) => { this.photoError = err.error.message || 'Error uploading photo'; }
    });
  }

  onRemovePhoto() {
    this.photoError = '';

    this.userService.removePhoto().subscribe({
      next: (res) => { this.user.foto_profilo = null; },
      error: (err) => { this.photoError = err.error.message || 'Error removing photo'; }
    });
  }

}
