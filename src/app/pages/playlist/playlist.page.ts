import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Playlist } from '../../services/playlist';

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

  constructor(private pl : Playlist, private route : ActivatedRoute) { }

  ngOnInit() {
    const playlistID = this.route.snapshot.paramMap.get("playlistId");
    if (!playlistID) return;

    this.pl.getPlaylistById(+playlistID).subscribe({
      next: (res) => {this.playlist = res;},
      error: (err) => {console.error("Playlist not found", err)}
    });

    this.pl.getSongs(+playlistID).subscribe({
      next: (res) => {this.songs = res;},
      error: (err) => {console.error("Songs not found", err)}
    });
    
  }

}