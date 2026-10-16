import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonToolbar, IonButtons, IonTitle, IonButton, IonSearchbar, IonIcon, IonAvatar } from '@ionic/angular/standalone';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import { menuOutline, closeOutline } from 'ionicons/icons';
import { Auth } from 'src/app/services/auth';
import { User } from 'src/app/services/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonToolbar, IonButtons, IonTitle, IonButton, IonSearchbar, IonIcon, IonAvatar, RouterLink],
})
export class NavbarComponent  implements OnInit {

  public isLoggedIn = false;
  public photo: string | null = null;
  public isMenuOpen = false;

  constructor(private auth : Auth, private userService : User, private router : Router) {
    addIcons({ menuOutline, closeOutline });
  }

  ngOnInit() {
    this.checkLogin();

    // Ionic tiene in memoria le pagine già aperte, quindi ngOnInit non riparte dopo il login o il logout:
    // ricontrollo a ogni cambio di pagina
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLogin();
        this.isMenuOpen = false;
      }
    });
  }

  checkLogin() {
    const username = this.auth.getUsernameFromToken();

    if (!username) {
      this.isLoggedIn = false;
      this.photo = null;
      return;
    }

    this.isLoggedIn = true;
    this.userService.getUser(username).subscribe({
      next: (res) => { this.photo = res.foto_profilo; },
      error: (err) => { console.error('Error fetching user', err); }
    });
  }

  // Se l'utente non ha la foto uso quella di default
  getPhoto(): string {
    if (!this.photo) return 'assets/default-avatar.svg';
    return 'http://localhost:3000' + this.photo;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

}
