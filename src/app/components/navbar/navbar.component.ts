import { Component, OnInit } from '@angular/core';
import { IonToolbar, IonButtons, IonMenuButton, IonTitle, IonButton, IonSearchbar, IonIcon } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [IonToolbar, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonButton, IonSearchbar, IonIcon, RouterModule],
})
export class NavbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
