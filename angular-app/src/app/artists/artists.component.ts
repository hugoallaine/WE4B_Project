import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.css']
})
export class ArtistsComponent implements OnInit {
  artists: any[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }
}
