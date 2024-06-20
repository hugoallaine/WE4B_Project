import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-musics',
  templateUrl: './musics.component.html',
  styleUrls: ['./musics.component.css']
})
export class MusicsComponent implements OnInit {
  musics: any[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.loadMusics();
  }

  loadMusics(): void {
    this.musicService.getMusics().subscribe(musics => {
      this.musics = musics;
    });
  }
}
