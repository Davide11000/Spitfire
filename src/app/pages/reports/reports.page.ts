import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
import { IonContent, IonCard, IonItem, IonLabel, IonCardContent, IonButton, IonIcon, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { shieldOutline, checkmarkOutline, closeOutline, alertCircleOutline } from 'ionicons/icons';
import { TopmenuComponent } from '../../components/topmenu/topmenu.component';
import { Auth } from '../../services/auth';
import { ReportService } from '../services/report';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [TopmenuComponent, IonContent, IonCard, IonItem, IonLabel, IonCardContent, IonButton, IonIcon]
})
export class ReportsPage implements OnInit, OnDestroy {

  public segnalazioni: any[] = [];
  private authSub!: Subscription;
  private reportSub!: Subscription;

  private authService = inject(Auth);
  private reportService = inject(ReportService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ shieldOutline, checkmarkOutline, closeOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.authSub = this.authService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.authService.isModerator$.subscribe(isMod => {
          this.authService.isAdmin$.subscribe(isAdmin => {
            if (!isMod && !isAdmin) {
              this.router.navigate(['/home']);
            }
          });
        });
      }
    });

    this.reportSub = this.reportService.getSegnalazioni().subscribe(data => {
      this.segnalazioni = data;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.reportSub) this.reportSub.unsubscribe();
  }

  async accettaSegnalazione(segnalazione: any) {
    try {
      let percorsoCollezione = '';
      if (segnalazione.tipoEntita === 'canzone') {
        percorsoCollezione = 'valutazioni_canzoni';
      } else if (segnalazione.tipoEntita === 'album') {
        percorsoCollezione = 'valutazioni_album';
      } else if (segnalazione.tipoEntita === 'playlist') {
        percorsoCollezione = 'playlists';
      }

      if (percorsoCollezione) {
        const commentoDocRef = doc(
          this.firestore, 
          percorsoCollezione, 
          segnalazione.idEntita, 
          'commenti', 
          segnalazione.idCommento
        );
        await deleteDoc(commentoDocRef);
      }

      await this.reportService.eliminaSegnalazione(segnalazione.id);
      this.mostraToast('Comment removed and report closed.');
    } catch (e) {
      console.error(e);
      this.mostraToast('Error during comment deletion.');
    }
  }

  async rifiutaSegnalazione(idSegnalazione: string) {
    try {
      await this.reportService.eliminaSegnalazione(idSegnalazione);
      this.mostraToast('Report discarded without changes.');
    } catch (e) {
      console.error(e);
      this.mostraToast('Error during report deletion.');
    }
  }

  vaiAlProfilo(usId: string) {
    if (usId) {
      this.router.navigate(['/profile', usId]);
    } else {
      console.warn("Impossibile navigare.");
    }
  }

  vaiAllaPagina(page: any){
    if(page){
      page.tipoEntita == "canzone" ? this.router.navigate(['/songtemplate', page.idEntita]) : this.router.navigate(['/albumtemplate', page.idEntita]);
    }
    else{
      console.warn("Impossibile navigare.");
    }
  }

  private async mostraToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}