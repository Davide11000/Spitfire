import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonText, IonInput, IonSpinner, IonButton, IonInputPasswordToggle } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonSpinner, IonContent, FormsModule, IonText, IonInput, IonButton, IonInputPasswordToggle, RouterLink, NavbarComponent, FooterComponent]
})
export class RegisterPage implements OnInit {

  public username = '';
  public email = '';
  public password = '';
  public errorMessage = '';
  public sending = false;

  constructor(private auth : Auth, private router : Router) { }

  ngOnInit() {
  }

  onRegister(){
    this.errorMessage = "";

    if(!this.username ||!this.email || !this.password){
      this.errorMessage = "Please fill in all required fields!"
      return;
    }

    this.sending = true;

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.sending = false;
        this.auth.saveToken(res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error?.message || "Error during registration";
      }
    });
  }

}
