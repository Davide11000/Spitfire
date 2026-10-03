import { Component, OnInit } from '@angular/core';
import { IonToolbar, IonButtons, IonMenuButton, IonTitle, IonButton, IonSearchbar, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [IonToolbar, IonButtons, IonMenuButton, IonTitle, IonButton, IonSearchbar, IonIcon],
})
export class NavbarComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
