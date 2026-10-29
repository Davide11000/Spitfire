import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { IonContent, IonSpinner, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonText, IonInput } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, lockClosedOutline, closeOutline, logOutOutline, imageOutline, trashOutline, globeOutline, cameraOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Follow } from '../../services/follow';
import { User } from '../../services/user';
import { Playlist } from '../../services/playlist';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonSpinner, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonText, NavbarComponent, IonInput]
})
export class ProfilePage implements OnInit {

  public user : any = null; //Salvo in questa variabile i dati dell'utente
  public isOwnProfile : boolean = false;
  public targetUsername: string | null = null;
  public errorMessage = '';
  public photoError = '';
  public followError = '';

  public followers: any[] = [];
  public following: any[] = [];
  public isFollowing: boolean = false;

  public playlists: any[] = [];

  // Finestra per creare una nuova playlist
  public isCreateOpen = false;
  public newPlaylistName = '';
  public newPlaylistPublic = true;
  public newPlaylistImage: File | null = null;
  public newPlaylistPreview = '';
  public createError = '';
  public creating = false;
  // Playlist da aprire appena la finestra ha finito di chiudersi
  private playlistToOpen: number | null = null;

  // Preferiti
  public favouriteSongs: any[] = [];
  public favouriteRecords: any[] = [];
  public favouriteArtists: any[] = [];

  // Modal con la lista di follower / following
  public isModalOpen = false;
  public modalTitle = '';
  public modalUsers: any[] = [];
  // Profilo da aprire appena la modal ha finito di chiudersi
  private profileToOpen: string | null = null;

  constructor(private auth : Auth, private router : Router, private route : ActivatedRoute, private follow : Follow,
              private userService : User, private pl : Playlist) {
    addIcons({ addOutline, lockClosedOutline, closeOutline, logOutOutline, imageOutline, trashOutline, globeOutline, cameraOutline });
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

  // Ionic chiama questa funzione ogni volta che si torna sulla pagina (ngOnInit invece parte solo la prima volta):
  // ricarico le playlist, così dopo averne eliminata una non resta nella lista
  ionViewWillEnter() {
    if (this.targetUsername) {
      this.loadPlaylists(this.targetUsername);
    }
  }

  loadPlaylists(username: string) {
    this.pl.getUserPlaylists(username).subscribe({
      next: (res) => { this.playlists = res; },
      error: (err) => { console.error('Error fetching playlists', err); }
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

    this.loadPlaylists(username);

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

  // Se l'immagine non c'è uso quella di default
  getPhoto(photo: string | null): string {
    if (!photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + photo;
  }

  getCover(image: string | null): string {
    if (!image) return 'assets/default-cover.svg';
    return 'http://localhost:3000' + image;
  }

  // La canzone usa la sua immagine, se non ce l'ha quella dell'album
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

  // Prima chiudo la modal, poi cambio pagina in onModalClosed():
  // se cambiassi pagina subito, la modal resterebbe aperta sopra il nuovo profilo
  goToProfile(username: string) {
    this.profileToOpen = username;
    this.isModalOpen = false;
  }

  // Chiamata quando la modal ha finito di chiudersi (didDismiss)
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

  // NUOVA PLAYLIST

  onCreatePlaylist() {
    this.newPlaylistName = '';
    this.newPlaylistPublic = true;
    this.newPlaylistImage = null;
    this.newPlaylistPreview = '';
    this.createError = '';
    this.isCreateOpen = true;
  }

  // Chiamata quando la finestra "New playlist" ha finito di chiudersi (didDismiss):
  // se la playlist è stata creata apro la sua pagina, se si è premuto Cancel non succede niente
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
    event.target.value = ''; // così si può riscegliere lo stesso file
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.createError = 'The image must be smaller than 5 MB';
      return;
    }

    this.newPlaylistImage = file;
    this.newPlaylistPreview = URL.createObjectURL(file); // anteprima nel browser
  }

  removeCover() {
    this.newPlaylistImage = null;
    this.newPlaylistPreview = '';
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
    this.pl.createPlaylist(this.newPlaylistName, this.newPlaylistPublic, this.newPlaylistImage).subscribe({
      next: (res) => {
        this.creating = false;
        this.playlists.push(res);
        // Chiudo la finestra: la pagina della playlist si apre in onCreateClosed()
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
