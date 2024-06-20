import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.css']
})
export class ArtistsComponent implements OnInit {
  artists: any[] = [];

  constructor(private musicService: MusicService, private router: Router) { }

  ngOnInit(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
