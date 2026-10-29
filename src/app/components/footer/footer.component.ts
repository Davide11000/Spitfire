import { Component, OnInit } from '@angular/core';
import { IonFooter, IonToolbar, IonTitle, IonButtons, IonLabel, IonIcon, IonButton, IonContent, IonGrid, IonRow, IonCol } from "@ionic/angular";
import { addIcons } from 'ionicons';
import { logoInstagram, logoFacebook, mailOutline, logoTwitter } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [IonLabel, IonIcon, IonGrid, IonRow, IonCol],
})
export class FooterComponent  implements OnInit {

  constructor() { addIcons({logoInstagram, logoFacebook, mailOutline, logoTwitter});}

  ngOnInit() {}

}
