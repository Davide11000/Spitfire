import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonModal, IonSelect, IonSelectOption, IonTextarea, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { languageOutline, caretDown, caretUp, addOutline, closeOutline, checkmarkCircle, checkmark } from 'ionicons/icons';
import { Song } from '../../services/song';
import { Request } from '../../services/request';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-translation-menu',
  templateUrl: './translation-menu.component.html',
  styleUrls: ['./translation-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonButton, IonIcon, IonModal, IonSelect, IonSelectOption, IonTextarea],
})
export class TranslationMenuComponent implements OnChanges {
  @Input() songId!: number;
  @Input() songName = '';
  @Input() originalLanguage: string | null = null;

  @Output() selected = new EventEmitter<any>();

  public translations: any[] = [];
  public current: any = null;
  public menuOpen = false;

  public isAddOpen = false;
  public newLanguage = '';
  public newLyrics = '';
  public error = '';
  public sending = false;

  public languageList = ['English', 'Italian', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean', 'Other'];
  public selectOptions = { cssClass: 'dark-select', size: 'cover' };

  constructor(private songService : Song, private requestService : Request, private auth : Auth, private router : Router,
              private toastC : ToastController) {
    addIcons({ languageOutline, caretDown, caretUp, addOutline, closeOutline, checkmarkCircle, checkmark });
  }

  ngOnChanges() {
    this.current = null;
    this.menuOpen = false;
    if (!this.songId && this.songId !== 0) return;

    this.songService.getTranslations(this.songId).subscribe({
      next: (res) => { this.translations = res; },
      error: (err) => console.error(err)
    });
  }

  getAvailableLanguages(): string[] {
    return this.languageList.filter(l => l !== this.originalLanguage);
  }

  choose(translation: any) {
    this.current = translation;
    this.menuOpen = false;
    this.selected.emit(translation);
  }

  openAdd() {
    this.menuOpen = false;

    if (!this.auth.getUsernameFromToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.newLanguage = '';
    this.newLyrics = '';
    this.error = '';
    this.isAddOpen = true;
  }

  onLanguage(event: any) {
    this.newLanguage = event.detail.value;
    this.error = '';
  }

  onLyrics(event: any) {
    this.newLyrics = event.detail.value;
    this.error = '';
  }

  send() {
    if (!this.newLanguage || !this.newLyrics.trim()) {
      this.error = 'Choose a language and write the translated lyrics';
      return;
    }

    const formData = new FormData();
    formData.append('type', 'translation');
    formData.append('targetId', String(this.songId));
    formData.append('language', this.newLanguage);
    formData.append('lyrics', this.newLyrics.trim());

    this.sending = true;
    this.requestService.sendRequest(formData).subscribe({
      next: async (res) => {
        this.sending = false;
        this.isAddOpen = false;

        // Se l'ha aggiunta l'admin è già pubblicata: ricarico l'elenco delle traduzioni
        if (res.status === 'accepted') this.ngOnChanges();

        const toast = await this.toastC.create({
          message: res.status === 'accepted' ? 'Translation added!' : 'Translation sent! An admin will review it soon.',
          icon: 'checkmark-circle',
          duration: 2500,
          position: 'bottom',
          cssClass: 'dark-toast'
        });
        await toast.present();
      },
      error: (err) => {
        this.sending = false;
        this.error = err.error.message || 'Error sending the translation';
      }
    });
  }
}
