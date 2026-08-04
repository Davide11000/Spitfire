import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonInput, IonButton, IonInputPasswordToggle } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { LoadingController} from '@ionic/angular';
import { Auth } from 'src/app/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonText, IonInput, IonButton, IonInputPasswordToggle, RouterLink]
})
export class RegisterPage implements OnInit {

  public username = '';
  public email = '';
  public password = '';
  public errorMessage = '';

  constructor(private auth : Auth, private loadingC : LoadingController) { }

  ngOnInit() {
  }

  async onRegister(){
    this.errorMessage = "";

    if(!this.username ||!this.email || !this.password){
      this.errorMessage = "Please fill in all required fields!"
      return;
    }

    const loading = await this.loadingC.create({
      message: 'Loading...',
    });
    await loading.present();

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.errorMessage = err.error?.message || "Error during registration";
      }
    });
  }


}
