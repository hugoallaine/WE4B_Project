import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Music } from '../models/music.model';

@Component({
  selector: 'app-musics',
  templateUrl: './musics.component.html',
  styleUrls: ['./musics.component.css']
})
export class MusicsComponent implements OnInit {
  musics: Music[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.getMusics();
  }

  getMusics(): void {
    this.musicService.getMusics().subscribe(data => {
      this.musics = data;
    });
  }
}
