import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Artist } from '../models/artist.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  artists: Artist[] = [];


  constructor(private musicService: MusicService, private router: Router) { }

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
