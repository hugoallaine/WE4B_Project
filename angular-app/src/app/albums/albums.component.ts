import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';
import { Album, Artist } from '../models/artist.model';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class AlbumsComponent implements OnInit {
  artists: Artist[] = [];

  constructor(
    private musicService: MusicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
