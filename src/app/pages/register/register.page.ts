import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonText, IonInput, IonButton, IonInputPasswordToggle } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { LoadingController} from '@ionic/angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, FormsModule, IonText, IonInput, IonButton, IonInputPasswordToggle, RouterLink, NavbarComponent]
})
export class RegisterPage implements OnInit {

  public username = '';
  public email = '';
  public password = '';
  public errorMessage = '';

  constructor(private auth : Auth, private loadingC : LoadingController, private router : Router) { }

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
        this.auth.saveToken(res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        loading.dismiss();
        this.errorMessage = err.error?.message || "Error during registration";
      }
    });
  }

}
