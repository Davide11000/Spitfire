import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonInputPasswordToggle, IonButton, IonInput } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { LoadingController} from '@ionic/angular';
import { Auth } from 'src/app/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonText, IonInputPasswordToggle, IonButton, IonInput, RouterLink]
})
export class LoginPage implements OnInit {

  public id = '';
  public password = '';
  public errorMessage = '';

  constructor(private auth : Auth, private loadingC : LoadingController, private router: Router) { }

  ngOnInit() {
  }

  async onLogin(){
    this.errorMessage = "";

    if(!this.id || !this.password){
      this.errorMessage = "Please fill in all required fields!"
      return;
    }

    const loading = await this.loadingC.create({
      message: 'Loading...',
    });
    await loading.present();

    this.auth.login(this.id, this.password).subscribe({
      next: (res) => {
        loading.dismiss();
        this.auth.saveToken(res.token);
        this.router.navigate(["/home"]);
      },
      error: (err) => {
        loading.dismiss();
        this.errorMessage = err.error?.message || "Error during login"
      }
    });

  }

}
