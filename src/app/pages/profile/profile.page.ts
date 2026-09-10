import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonImg, IonSpinner, IonButton } from '@ionic/angular/standalone';
import { Auth } from 'src/app/services/auth';
import { Follow } from 'src/app/services/follow';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonCard, IonImg, IonSpinner, IonButton]
})
export class ProfilePage implements OnInit {

  public user : any = null; //Salvo in questa variabile i dati dell'utente
  public isOwnProfile : boolean = false;
  public targetUsername: string | null = null;

  public followersCount: number = 0;
  public followingCount: number = 0;
  public isFollowing: boolean = false;

  constructor(private auth : Auth, private router : Router, private route : ActivatedRoute, private follow : Follow) { }

  ngOnInit() {
    const myUsername = this.auth.getUsernameFromToken();
    this.targetUsername = this.route.snapshot.paramMap.get("username");

    if (!this.targetUsername) {
      this.router.navigate(['/home']); 
      return;
    }

    this.isOwnProfile = myUsername === this.targetUsername;

    this.auth.getUserProfile(this.targetUsername).subscribe({
      next: (res) => { this.user = res; },
      error: (err) => { console.error('Utente non trovato', err); }
    });

    this.follow.getFollowers(this.targetUsername).subscribe({
      next: (res) => { this.followersCount = res.length; },
      error: (err) => { console.error('Error fetching followers', err); }
    });

    this.follow.getFollowing(this.targetUsername).subscribe({
      next: (res) => { this.followingCount = res.length; },
      error: (err) => { console.error('Error fetching followers', err); }
    });

    if (!this.isOwnProfile && myUsername) {
      this.follow.getFollowing(myUsername).subscribe({
        next: (res) => {
          this.isFollowing = res.some((f: any) => f.following === this.targetUsername);
        },
        error: (err) => { console.error('Error checking follow status', err); }
      });
    }
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onFollow() {
    if (!this.targetUsername) return;

    if (this.isFollowing){
      this.follow.unfollowUser(this.targetUsername).subscribe({
        next: (res) => {
          this.isFollowing = false;
          this.followersCount--;
        },
        error: (err) => { 
          console.error('Error unfollowing user', err); 
        }
      });
    } else {
      this.follow.followUser(this.targetUsername).subscribe({
        next: (res) => {
          this.isFollowing = true;
          this.followersCount++;
        },
        error: (err) => {
          console.error('Error following user', err);
        }
      });
    }

  }




}
