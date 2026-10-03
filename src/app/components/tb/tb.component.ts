import { Component, OnInit, ViewChild } from '@angular/core';
import { IonToolbar, IonHeader, IonButton, IonButtons, IonSearchbar, IonMenu, IonContent, IonList, IonItem, IonTitle, IonMenuButton, IonIcon } from "@ionic/angular";
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';

@Component({
  selector: 'app-tb',
  templateUrl: './tb.component.html',
  styleUrls: ['./tb.component.scss'],
  imports: [IonToolbar, IonHeader, IonButton, IonButtons, IonSearchbar, IonMenu, IonContent, IonList, IonItem, IonTitle, IonMenuButton, IonIcon],
})
export class TbComponent  implements OnInit {
  isActive = false;
  constructor() { addIcons({search});}

  @ViewChild('mobileSearch') mobileSearch!: IonSearchbar;

  activateSearch() {
    this.isActive = true;
    setTimeout(() => {
      this.mobileSearch.setFocus();
    }, 150); 
  }

  ngOnInit() {}

}
