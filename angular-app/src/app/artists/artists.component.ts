import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Artist } from '../models/artist.model';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.css']
})
export class ArtistsComponent implements OnInit {

  artists: Artist[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.musicService.getArtists().subscribe(data => {
      this.artists = data;
    });
  }
}
