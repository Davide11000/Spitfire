import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonInputPasswordToggle, IonButton, IonInput, IonSpinner } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, IonText, IonInputPasswordToggle, IonButton, IonInput, IonSpinner, RouterLink, NavbarComponent, FooterComponent]
})
export class LoginPage implements OnInit {

  public id = '';
  public password = '';
  public errorMessage = '';
  public sending = false;

  constructor(private auth : Auth, private router: Router) { }

  ngOnInit() {
  }

  onLogin(){
    this.errorMessage = "";

    if(!this.id || !this.password){
      this.errorMessage = "Please fill in all required fields!"
      return;
    }

    this.sending = true;

    this.auth.login(this.id, this.password).subscribe({
      next: (res) => {
        this.sending = false;
        this.auth.saveToken(res.token);
        this.router.navigate(["/home"]);
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error?.message || "Error during login"
      }
    });

  }

}
