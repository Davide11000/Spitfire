import { Component, OnInit } from '@angular/core';
import { IonToolbar, IonButtons, IonMenuButton, IonTitle, IonButton, IonSearchbar, IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [IonToolbar, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonButton, IonSearchbar, IonIcon],
})
export class NavbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
