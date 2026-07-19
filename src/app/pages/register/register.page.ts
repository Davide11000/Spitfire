import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonInput, IonButton, IonInputPasswordToggle } from '@ionic/angular/standalone';
import { LoadingController} from '@ionic/angular';
import { Auth } from 'src/app/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonText, IonInput, IonButton, IonInputPasswordToggle]
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
      this.errorMessage = "Compila tutti i campi richiesti!"
      return;
    }

    const loading = await this.loadingC.create({
      message: 'Creazione account in corso...',
    });
    await loading.present();

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.errorMessage = err.error?.message || "Errore durante la registrazione";
      }
    });
  }


}
