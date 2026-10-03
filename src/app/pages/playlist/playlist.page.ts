import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, CommonModule]
})
export class PlaylistPage implements OnInit {

  public playlist: any = null;
  public songs: any[] = [];

  constructor() { }

  ngOnInit() {
    // per ora dati finti, giusto per vedere il layout
    this.playlist = { id: 1, name: "Test Playlist", username: "mario" };
    this.songs = [
      { id: 1, songname: "Test Song 1", artname: "Test Artist" },
      { id: 2, songname: "Test Song 2", artname: "Another Artist" }
    ];
  }

}