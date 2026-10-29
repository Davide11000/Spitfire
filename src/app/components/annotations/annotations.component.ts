import { Component, OnChanges, SimpleChanges, inject, ChangeDetectorRef, ElementRef, ViewChild, Input } from '@angular/core';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonButton, IonSpinner, IonIcon, IonTextarea, ToastController } from '@ionic/angular';
import { AnnotationService } from '../../services/annotation';
import { addIcons } from 'ionicons';
import { closeOutline, sendOutline, addCircleOutline, thumbsUpOutline, thumbsUpSharp, thumbsDownOutline, thumbsDownSharp, checkmarkOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-annotations',
  standalone: true,
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss'],
  imports: [FormsModule, IonButton, IonSpinner, IonIcon]
})
export class AnnotationsComponent implements OnChanges {

  @ViewChild('lyricsContainer') lyricsContainerRef!: ElementRef;

  @Input() songId: string | null = null;
  @Input() canzone: any = null;
  @Input() testoFormattato: string = '';
  @Input() caricamentoTesto: boolean = false;
  @Input() mioUid: string | null = null;
  @Input() mioNome: string = 'Utente';
  @Input() isAdmin: boolean = false;
  @Input() isModerator: boolean = false;
  @Input() isMobile: boolean = false;

  public testoConAnnotazioni: SafeHtml = '';

  public annotazioni: any[] = [];
  public annotazioneAperta: any = null;
  public formAnnotazioneAperto: boolean = false;
  public testoSelezioneCorrente: string = '';
  public startIndexCorrente: number = -1;
  public endIndexCorrente: number = -1;
  public nuovaAnnotazioneTesto: string = '';
  public nuovoImprovementTesto: string = '';
  public selectionPopup: { visible: boolean; top: number; left: number } = { visible: false, top: 0, left: 0 };

  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private annotationService = inject(AnnotationService);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ closeOutline, sendOutline, addCircleOutline, thumbsUpOutline, thumbsUpSharp, thumbsDownOutline, thumbsDownSharp, checkmarkOutline, trashOutline });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['songId'] && this.songId) {
      this.chiudiAnnotazione();
      this.chiudiFormAnnotazione();
      this.caricaAnnotazioni(this.songId);
    } else if (changes['testoFormattato'] || changes['canzone']) {
      this.aggiornaTestoConAnnotazioni();
    }
  }

  async caricaAnnotazioni(songId: string) {
    try {
      this.annotazioni = await this.annotationService.getAnnotazioni(songId);
      this.aggiornaTestoConAnnotazioni();
      this.cdr.detectChanges();
    } catch (err) {
      console.error("Errore nel recupero delle annotazioni:", err);
    }
  }

  aggiornaTestoConAnnotazioni() {
    console.log('=== AGGIORNA TESTO CON ANNOTAZIONI ===');
    console.log('annotazioni:', this.annotazioni);
    console.log('testo originale:', this.canzone?.testo?.slice(0, 100));
    if (!this.canzone || !this.canzone.testo) {
      this.testoConAnnotazioni = this.testoFormattato;
      return;
    }

    const testoOriginale: string = this.canzone.testo;

    const annotazioniOrdinate = [...this.annotazioni].sort((a, b) => a.startIndex - b.startIndex);

    let risultato = '';
    let posizioneCorrente = 0;

    for (const ann of annotazioniOrdinate) {
      const start: number = ann.startIndex;
      const end: number = ann.endIndex;

      if (start < posizioneCorrente) continue;

      const prima = testoOriginale.slice(posizioneCorrente, start).replace(/\n/g, '<br>');
      const evidenziato = testoOriginale.slice(start, end).replace(/\n/g, '<br>');
      risultato += prima;
      risultato += `<span class="annotated-text" data-annotation-id="${ann.id}">${evidenziato}</span>`;
      posizioneCorrente = end;
    }

    risultato += testoOriginale.slice(posizioneCorrente).replace(/\n/g, '<br>');
    this.testoConAnnotazioni = this.sanitizer.bypassSecurityTrustHtml(risultato);
  }

  onTestoSelezionato(event: MouseEvent | TouchEvent) {
    setTimeout(() => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        this.selectionPopup.visible = false;
        this.cdr.detectChanges();
        return;
      }

      const testoSelezionato = selection.toString().trim();
      if (!testoSelezionato || testoSelezionato.length === 0) {
        this.selectionPopup.visible = false;
        this.cdr.detectChanges();
        return;
      }

      const rangeSelezionato = selection.getRangeAt(0);
      const containerLyrics = this.lyricsContainerRef?.nativeElement;
      if (!containerLyrics || !containerLyrics.contains(rangeSelezionato.commonAncestorContainer)) {
        this.selectionPopup.visible = false;
        this.cdr.detectChanges();
        return;
      }

      // Controlla se qualsiasi nodo nel range selezionato appartiene a un'annotazione esistente
      const fragmentClonato = rangeSelezionato.cloneContents();
      const spanNelRange = fragmentClonato.querySelectorAll('[data-annotation-id]');
      const antenatiAnnotati = (rangeSelezionato.commonAncestorContainer.parentElement as HTMLElement)?.closest('[data-annotation-id]');
      if (spanNelRange.length > 0 || antenatiAnnotati) {
        this.selectionPopup.visible = false;
        this.cdr.detectChanges();
        return;
      }

      if (!this.mioUid) {
        this.selectionPopup.visible = false;
        this.cdr.detectChanges();
        return;
      }

      const testoOriginale: string = this.canzone?.testo || '';
      const startIndex = testoOriginale.indexOf(testoSelezionato);
      if (startIndex === -1) {
        this.selectionPopup.visible = false;
        this.cdr.detectChanges();
        return;
      }

      this.testoSelezioneCorrente = testoSelezionato;
      this.startIndexCorrente = startIndex;
      this.endIndexCorrente = startIndex + testoSelezionato.length;

      const rect = rangeSelezionato.getBoundingClientRect();
      const containerRect = containerLyrics.getBoundingClientRect();
      this.selectionPopup.top = rect.bottom - containerRect.top + 8;
      this.selectionPopup.left = rect.left - containerRect.left;
      this.selectionPopup.visible = true;

      this.cdr.detectChanges();
    }, 10);
  }

  apriFormAnnotazione() {
    this.formAnnotazioneAperto = true;
    this.annotazioneAperta = null;
    this.nuovaAnnotazioneTesto = '';
    this.selectionPopup.visible = false;
    this.cdr.detectChanges();
  }

  chiudiFormAnnotazione() {
    this.formAnnotazioneAperto = false;
    this.nuovaAnnotazioneTesto = '';
    this.testoSelezioneCorrente = '';
    this.startIndexCorrente = -1;
    this.endIndexCorrente = -1;
    this.selectionPopup.visible = false;
    this.cdr.detectChanges();
  }

  apriAnnotazione(ann: any) {
    this.annotazioneAperta = ann;
    this.formAnnotazioneAperto = false;
    this.nuovoImprovementTesto = '';
    this.selectionPopup.visible = false;
    this.cdr.detectChanges();
  }

  chiudiAnnotazione() {
    this.annotazioneAperta = null;
    this.nuovoImprovementTesto = '';
    this.cdr.detectChanges();
  }

  async inviaAnnotazione() {
    if (!this.mioUid || !this.songId || !this.nuovaAnnotazioneTesto.trim()) return;
    try {
      await this.annotationService.creaAnnotazione(this.songId, {
        testoSelezionato: this.testoSelezioneCorrente,
        startIndex: this.startIndexCorrente,
        endIndex: this.endIndexCorrente,
        testoAnnotazione: this.nuovaAnnotazioneTesto.trim(),
        uid: this.mioUid,
        nome: this.mioNome
      });
      await this.caricaAnnotazioni(this.songId);
      this.chiudiFormAnnotazione();
      const toast = await this.toastController.create({ message: 'Annotation submitted!', duration: 2500, position: 'bottom', color: 'dark' });
      await toast.present();
    } catch (err) {
      console.error("Errore invio annotazione:", err);
    }
  }

  async inviaImprovement(ann: any) {
    if (!this.mioUid || !this.songId || !this.nuovoImprovementTesto.trim()) return;
    try {
      await this.annotationService.aggiungiImprovement(this.songId, ann.id, {
        uid: this.mioUid,
        nome: this.mioNome,
        testo: this.nuovoImprovementTesto.trim()
      });
      await this.caricaAnnotazioni(this.songId);
      this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
      this.nuovoImprovementTesto = '';
      const toast = await this.toastController.create({ message: 'Improvement submitted!', duration: 2500, position: 'bottom', color: 'dark' });
      await toast.present();
    } catch (err) {
      console.error("Errore invio improvement:", err);
    }
  }

  haLikeAnnotazione(ann: any): boolean {
    return !!this.mioUid && ann.likes?.includes(this.mioUid);
  }

  haDislikeAnnotazione(ann: any): boolean {
    return !!this.mioUid && ann.dislikes?.includes(this.mioUid);
  }

  async toggleLikeAnnotazione(ann: any) {
    if (!this.mioUid || !this.songId) return;
    await this.annotationService.toggleLikeAnnotazione(this.songId, ann.id, this.mioUid, this.haLikeAnnotazione(ann));
    await this.caricaAnnotazioni(this.songId);
    this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
  }

  async toggleDislikeAnnotazione(ann: any) {
    if (!this.mioUid || !this.songId) return;
    await this.annotationService.toggleDislikeAnnotazione(this.songId, ann.id, this.mioUid, this.haDislikeAnnotazione(ann));
    await this.caricaAnnotazioni(this.songId);
    this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
  }

  haLikeImprovement(imp: any): boolean {
    return !!this.mioUid && imp.likes?.includes(this.mioUid);
  }

  haDislikeImprovement(imp: any): boolean {
    return !!this.mioUid && imp.dislikes?.includes(this.mioUid);
  }

  async toggleLikeImprovement(ann: any, imp: any) {
    if (!this.mioUid || !this.songId) return;
    await this.annotationService.toggleLikeImprovement(this.songId, ann.id, ann.improvements, imp.id, this.mioUid, this.haLikeImprovement(imp));
    await this.caricaAnnotazioni(this.songId);
    this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
  }

  async toggleDislikeImprovement(ann: any, imp: any) {
    if (!this.mioUid || !this.songId) return;
    await this.annotationService.toggleDislikeImprovement(this.songId, ann.id, ann.improvements, imp.id, this.mioUid, this.haDislikeImprovement(imp));
    await this.caricaAnnotazioni(this.songId);
    this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
  }

  async approvaAnnotazione(ann: any) {
    if (!this.songId) return;
    try {
      await this.annotationService.approvaAnnotazione(this.songId, ann.id);
      await this.caricaAnnotazioni(this.songId);
      this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
      const toast = await this.toastController.create({ message: 'Annotation approved.', duration: 2000, position: 'bottom', color: 'dark' });
      await toast.present();
    } catch (err) {
      console.error(err);
    }
  }

  async rifiutaAnnotazione(ann: any) {
    if (!this.songId) return;
    try {
      await this.annotationService.rifiutaAnnotazione(this.songId, ann.id);
      await this.caricaAnnotazioni(this.songId);
      this.chiudiAnnotazione();
      const toast = await this.toastController.create({ message: 'Annotation deleted.', duration: 2000, position: 'bottom', color: 'dark' });
      await toast.present();
    } catch (err) {
      console.error(err);
    }
  }

  async accettaImprovement(ann: any, imp: any) {
    if (!this.songId) return;
    try {
      await this.annotationService.accettaImprovement(
        this.songId, ann.id, ann.improvements, imp.id,
        imp.testo, { uid: imp.uid, nome: imp.nome }, ann.contributori
      );
      await this.caricaAnnotazioni(this.songId);
      this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
      const toast = await this.toastController.create({ message: 'Improvement accepted.', duration: 2000, position: 'bottom', color: 'dark' });
      await toast.present();
    } catch (err) {
      console.error(err);
    }
  }

  async rifiutaImprovement(ann: any, imp: any) {
    if (!this.songId) return;
    try {
      await this.annotationService.rifiutaImprovement(this.songId, ann.id, ann.improvements, imp.id);
      await this.caricaAnnotazioni(this.songId);
      this.annotazioneAperta = this.annotazioni.find(a => a.id === ann.id) || null;
      const toast = await this.toastController.create({ message: 'Improvement discarded.', duration: 2000, position: 'bottom', color: 'dark' });
      await toast.present();
    } catch (err) {
      console.error(err);
    }
  }

  onClickLyrics(event: MouseEvent) {
  console.log('=== CLICK LYRICS ===');
  console.log('target:', event.target);
  console.log('innerHTML del target:', (event.target as HTMLElement).outerHTML);
  const target = event.target as HTMLElement;
  console.log('target tagName:', target.tagName);
  console.log('target className:', target.className);
  const spanAnnotato = target.closest('[data-annotation-id]') as HTMLElement;
  console.log('spanAnnotato trovato:', spanAnnotato);
  if (spanAnnotato) {
    const annId = spanAnnotato.getAttribute('data-annotation-id');
    console.log('annotation id:', annId);
    console.log('annotazioni disponibili:', this.annotazioni);
    const ann = this.annotazioni.find(a => a.id === annId);
    console.log('annotazione trovata:', ann);
    if (ann) {
      this.apriAnnotazione(ann);
    }
  }
}

}