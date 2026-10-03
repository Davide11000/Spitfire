import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { RatingService } from '../../services/rating'; 
import { Auth } from '../../services/auth';
import { addIcons } from 'ionicons';
import { star, starHalf, starOutline } from 'ionicons/icons';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent implements OnInit {
  @Input() id!: string; 
  @Input() tipo!: 'album' | 'canzone'; 

  private ratingService = inject(RatingService);
  private authService = inject(Auth);
  private router = inject(Router);

  utenteLoggatoUid: string = '';
  votoMedio: number = 0;
  votoUtente: number = 0;
  votoHover: number = 0;

  constructor() {
    addIcons({ star, starHalf, starOutline });
  }

  ngOnInit() {
    if (!this.id || !this.tipo) return;

    this.ratingService.ascoltaMediaGlobale(this.id, this.tipo).subscribe({
      next: (media) => this.votoMedio = media,
      error: (err) => console.error("Errore media globale:", err)
    });

    this.authService.user$.subscribe({
      next: (user) => {
        if (user) {
          this.utenteLoggatoUid = user.uid;
          this.ratingService.ascoltaVotoUtente(this.id, this.utenteLoggatoUid, this.tipo).subscribe({
            next: (voto) => this.votoUtente = voto,
            error: (err) => console.error("Errore voto utente:", err)
          });
        }
      }
    });
  }

  getIconaStella(indiceStella: number): 'full' | 'half' | 'empty' {
    const votoRiferimento = this.votoHover > 0 ? this.votoHover : this.votoUtente;
    if (votoRiferimento >= indiceStella) return 'full';
    if (votoRiferimento >= indiceStella - 0.5) return 'half';
    return 'empty';
  }

  gestisciHoverStella(event: MouseEvent, indiceStella: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const xSelezionata = event.clientX - rect.left;

    if (xSelezionata < rect.width / 2) {
      this.votoHover = indiceStella - 0.5;
    } else {
      this.votoHover = indiceStella;
    }
  }

  resetHoverStella() {
    this.votoHover = 0;
  }

  async inviaVotoStella(event: MouseEvent, indiceStella: number) {
    if (!this.utenteLoggatoUid) {
      await this.router.navigate(['/login']);
      return;
    }

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const xSelezionata = event.clientX - rect.left;
    let votoScelto = indiceStella;

    if (xSelezionata < rect.width / 2) {
      votoScelto = indiceStella - 0.5;
    }

    try {
      await this.ratingService.inviaVoto(this.id, this.utenteLoggatoUid, votoScelto, this.tipo);
      this.votoUtente = votoScelto;
    } catch (error) {
      console.error("Errore durante l'invio del voto:", error);
    }
  }
}