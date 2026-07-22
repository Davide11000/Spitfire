import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonImg, IonSpinner } from '@ionic/angular/standalone';
import { Auth } from 'src/app/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonCard, IonImg, IonSpinner]
})
export class ProfilePage implements OnInit {

  public user : any = null; //Salvo in questa variabile i dati dell'utente

  constructor(private auth : Auth, private router : Router) { }

  ngOnInit() {
    const token = this.auth.getToken();
  
    this.auth.getProfile(token!).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });
  }

}
