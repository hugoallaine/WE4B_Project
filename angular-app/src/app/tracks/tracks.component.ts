import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Artist } from '../models/artist.model';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  artists: Artist[] = [];


  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }
}
