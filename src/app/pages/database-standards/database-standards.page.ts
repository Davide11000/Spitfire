import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-database-standards',
  templateUrl: './database-standards.page.html',
  styleUrls: ['./database-standards.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonContent, RouterLink, NavbarComponent, FooterComponent]
})
export class DatabaseStandardsPage {

  public sections = [
    { id: 'requests', title: 'Requests' },
    { id: 'lyrics', title: 'Lyrics' },
    { id: 'annotations', title: 'Annotations' }
  ];

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
