import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  createOutline, closeOutline, checkmarkOutline, trashOutline,
  thumbsUpOutline, thumbsUpSharp, thumbsDownOutline, thumbsDownSharp, addOutline, pencilOutline
} from 'ionicons/icons';
import { GenreService, TipoEntita } from '../../services/genre';
import { GENERI_DISPONIBILI } from '../../constants/generi';

@Component({
  selector: 'app-genres',
  standalone: true,
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
  imports: [CommonModule, FormsModule, IonButton, IonIcon]
})
export class GenresComponent implements OnChanges {
  @Input() entityId!: string;
  @Input() tipo!: TipoEntita;
  @Input() generiAttuali: string[] = [];
  @Input() mioUid: string | null = null;
  @Input() mioNome: string = 'Utente';
  @Input() isAdmin: boolean = false;
  @Input() isModerator: boolean = false;

  public readonly GENERI_DISPONIBILI = GENERI_DISPONIBILI;
  public generiCorrenti: string[] = [];
  public proposte: any[] = [];
  public proposteVisibili = false;

  public modalAperto = false;
  public modalTipo: 'add' | 'remove' = 'add';
  public selezione = new Set<string>();

  private genreService = inject(GenreService);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      createOutline, closeOutline, checkmarkOutline, trashOutline,
      thumbsUpOutline, thumbsUpSharp, thumbsDownOutline, thumbsDownSharp, addOutline, pencilOutline
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['generiAttuali']) {
      this.generiCorrenti = Array.isArray(this.generiAttuali) ? [...this.generiAttuali] : [];
    }
    if (changes['entityId'] && this.entityId) {
      this.caricaProposte();
    }
  }

  async caricaProposte() {
    try {
      this.proposte = await this.genreService.getGenreChanges(this.tipo, this.entityId);
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
    }
  }

  get generiVisualizzati(): string {
    return this.generiCorrenti.join(', ');
  }

  toggleProposte() {
    this.proposteVisibili = !this.proposteVisibili;
  }

  apriModal(tipo: 'add' | 'remove') {
    if (!this.mioUid) return;
    this.modalTipo = tipo;
    this.selezione.clear();
    this.modalAperto = true;
  }

  chiudiModal() {
    this.modalAperto = false;
  }

  toggleGenere(g: string) {
    if (this.selezione.has(g)) this.selezione.delete(g);
    else this.selezione.add(g);
  }

  isSelezionato(g: string) {
    return this.selezione.has(g);
  }

  get generiModal(): string[] {
    if (this.modalTipo === 'remove') return this.generiCorrenti;
    return GENERI_DISPONIBILI.filter(g => !this.generiCorrenti.includes(g));
  }

  async confermaProposta() {
    if (!this.mioUid || this.selezione.size === 0) return;
    try {
      await this.genreService.proponiGenreChange(this.tipo, this.entityId, {
        generi: Array.from(this.selezione),
        tipoCambio: this.modalTipo,
        uid: this.mioUid,
        nome: this.mioNome
      });
      this.modalAperto = false;
      await this.caricaProposte();
      this.toast('Proposta inviata, in attesa di revisione.');
    } catch (e) {
      console.error(e);
      this.toast('Errore invio proposta.');
    }
  }

  haLike(p: any) { return !!this.mioUid && (p.likes ?? []).includes(this.mioUid); }
  haDislike(p: any) { return !!this.mioUid && (p.dislikes ?? []).includes(this.mioUid); }

  async toggleLike(p: any) {
    if (!this.mioUid) return;
    await this.genreService.toggleLike(this.tipo, this.entityId, p.id, this.mioUid, this.haLike(p));
    await this.caricaProposte();
  }

  async toggleDislike(p: any) {
    if (!this.mioUid) return;
    await this.genreService.toggleDislike(this.tipo, this.entityId, p.id, this.mioUid, this.haDislike(p));
    await this.caricaProposte();
  }

  puoModerare() { return this.isAdmin || this.isModerator; }

  async approva(p: any) {
    try {
      const nuovi = await this.genreService.approvaGenreChange(this.tipo, this.entityId, p.id);
      this.generiCorrenti = nuovi;
      await this.caricaProposte();
      this.toast('Proposta approvata.');
    } catch (e) {
      console.error(e);
      this.toast('Errore approvazione.');
    }
  }

  async elimina(p: any) {
    try {
      await this.genreService.cancellaProposta(this.tipo, this.entityId, p.id);
      await this.caricaProposte();
    } catch (e) {
      console.error(e);
    }
  }

  puoEliminare(p: any) {
    if (this.puoModerare()) return true;
    if (p.contributori?.[0]?.uid === this.mioUid) return true;
    return false;
  }

  private async toast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom' });
    await t.present();
  }
}
