import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonItem, IonLabel, IonTextarea, IonButton, IonList, IonText, IonNote, IonAvatar, IonIcon, AlertController } from '@ionic/angular';
import { CommentService } from '../../services/comment';
import { ReportService } from '../../services/report';
import { Auth } from '../../services/auth';
import { InteractionService } from '../../services/interaction';
import { UserService } from '../../services/user';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline, trashOutline, flagOutline, thumbsUpSharp, thumbsUpOutline, thumbsDownSharp, thumbsDownOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, IonItem, IonLabel, IonTextarea, IonButton, IonList, IonAvatar, IonIcon],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input() id!: string;
  @Input() tipo!: 'album' | 'canzone' | 'playlist';
  @Input() nomeEntita: string = '';

  private commentService = inject(CommentService);
  private reportService = inject(ReportService);
  public authService = inject(Auth);
  private interactionService = inject(InteractionService);
  private userService = inject(UserService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private cdr = inject(ChangeDetectorRef);

  utenteLoggatoUid: string = '';
  utenteLoggatoNome: string = '';
  utenteLoggatoFoto: string = '';
  utenteLoggatoRuolo: string = 'user';
  nuovoCommentoTesto: string = '';

  tuttiICommenti: any[] = [];
  commentiDellaPagina: any[] = [];

  paginaCorrente: number = 1;
  elementiPerPagina: number = 5;
  pagineTotali: number[] = [];

  commentiEspansi: { [key: string]: boolean } = {};

  private authSub!: Subscription;
  private commentiSub!: Subscription;

  constructor() {
    addIcons({ chevronDownOutline, chevronUpOutline, trashOutline, flagOutline, thumbsUpSharp, thumbsUpOutline, thumbsDownOutline, thumbsDownSharp });
  }

  ngOnInit() {
    this.authSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.utenteLoggatoUid = user.uid || '';
        this.utenteLoggatoNome = user.displayName || 'Utente';
        this.utenteLoggatoFoto = this.authService.fotoProfilo || user.photoURL || 'assets/shapes.svg';

        this.userService.getProfiloById(user.uid).pipe(take(1)).subscribe(profilo => {
          this.utenteLoggatoRuolo = profilo?.ruolo || 'user';
        });
      } else {
        this.utenteLoggatoUid = '';
        this.utenteLoggatoNome = '';
        this.utenteLoggatoFoto = '';
        this.utenteLoggatoRuolo = 'user';
      }
      this.cdr.detectChanges();
    });

    if (this.id) {
      this.caricaCommenti();
    }
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.commentiSub) this.commentiSub.unsubscribe();
  }

  caricaCommenti() {
    if (this.commentiSub) this.commentiSub.unsubscribe();

    this.commentiSub = this.commentService.getCommenti(this.id, this.tipo).subscribe({
      next: (data) => {
        this.tuttiICommenti = data;
        this.calcolaPagine();
        this.aggiornaPagina();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nella lettura dei commenti:", err);
      }
    });
  }

  calcolaPagine() {
    const numeroPagine = Math.ceil(this.tuttiICommenti.length / this.elementiPerPagina);
    this.pagineTotali = Array.from({ length: numeroPagine }, (_, i) => i + 1);
  }

  aggiornaPagina() {
    const inizio = (this.paginaCorrente - 1) * this.elementiPerPagina;
    const fine = inizio + this.elementiPerPagina;
    this.commentiDellaPagina = this.tuttiICommenti.slice(inizio, fine);
  }

  cambiaPagina(pagina: number) {
    this.paginaCorrente = pagina;
    this.aggiornaPagina();
    this.cdr.detectChanges();
  }

  deveTroncare(testo: string): boolean {
    if (!testo) return false;
    return testo.length > 150;
  }

  toggleEspandiCommento(commentoId: string) {
    this.commentiEspansi[commentoId] = !this.commentiEspansi[commentoId];
  }

  async pubblicaCommento() {
    if (!this.utenteLoggatoUid) {
      await this.router.navigate(['/login']);
      return;
    }

    if (!this.nuovoCommentoTesto || !this.nuovoCommentoTesto.trim()) return;

    const fotoDaInviare = this.authService.fotoProfilo || this.utenteLoggatoFoto || 'assets/shapes.svg';

    this.commentService.inviaCommento(
      this.id,
      this.tipo,
      this.utenteLoggatoUid,
      this.utenteLoggatoNome,
      fotoDaInviare,
      this.nuovoCommentoTesto,
      this.utenteLoggatoRuolo
    ).then(() => {
      this.nuovoCommentoTesto = '';
      this.cdr.detectChanges();
    }).catch(err => {
      console.error("Errore durante l'addDoc nel database:", err);
    });
  }

  async cancellaCommento(idCommento: string) {
    const alert = await this.alertController.create({
      header: 'ELIMINA COMMENTO',
      subHeader: 'Sei sicuro di volerlo fare?',
      cssClass: 'spitfire-alert',
      buttons: [
        { text: 'INDIETRO', role: 'cancel', cssClass: 'alert-btn-cancel' },
        {
          text: 'ELIMINA ORA',
          cssClass: 'alert-btn-delete',
          handler: () => {
            this.commentService.eliminaCommento(this.id, this.tipo, idCommento).then(() => {
              this.cdr.detectChanges();
            }).catch(err => {
              console.error("Errore eliminazione:", err);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async segnalaCommento(commento: any) {
    if (!this.utenteLoggatoUid) {
      await this.router.navigate(['/login']);
      return;
    }

    const alert = await this.alertController.create({
      header: 'SEGNALA COMMENTO',
      subHeader: 'Specifica la motivazione della segnalazione:',
      cssClass: 'spitfire-alert',
      inputs: [
        {
          name: 'motivazione',
          type: 'textarea',
          placeholder: 'Scrivi qui il motivo... (es. insulti, spam, ecc.)'
        }
      ],
      buttons: [
        { text: 'ANNULLA', role: 'cancel', cssClass: 'alert-btn-cancel' },
        {
          text: 'SEGNALA',
          cssClass: 'alert-btn-delete',
          handler: (data) => {
            const motivo = data.motivazione ? data.motivazione.trim() : '';
            this.reportService.inviaSegnalazione(
              commento.id,
              commento.testo,
              commento.uid_utente,
              commento.nome_utente,
              this.id,
              this.tipo,
              this.nomeEntita,
              this.utenteLoggatoUid,
              this.utenteLoggatoNome,
              motivo
            ).catch(err => {
              console.error("Errore invio segnalazione:", err);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  haMessoLike(commento: any): boolean {
    if (!this.utenteLoggatoUid || !commento.likes) return false;
    return commento.likes.includes(this.utenteLoggatoUid);
  }

  haMessoDislike(commento: any): boolean {
    if (!this.utenteLoggatoUid || !commento.dislikes) return false;
    return commento.dislikes.includes(this.utenteLoggatoUid);
  }

  async toggleLike(commento: any) {
    if (!this.utenteLoggatoUid) {
      await this.router.navigate(['/login']);
      return;
    }
    const giaLike = this.haMessoLike(commento);
    const giaDislike = this.haMessoDislike(commento);
    await this.interactionService.gestisciLike(this.id, this.tipo, commento.id, this.utenteLoggatoUid, giaLike, giaDislike);
  }

  async toggleDislike(commento: any) {
    if (!this.utenteLoggatoUid) {
      await this.router.navigate(['/login']);
      return;
    }
    const giaLike = this.haMessoLike(commento);
    const giaDislike = this.haMessoDislike(commento);
    await this.interactionService.gestisciDislike(this.id, this.tipo, commento.id, this.utenteLoggatoUid, giaLike, giaDislike);
  }
}