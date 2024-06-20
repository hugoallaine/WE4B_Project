import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class AlbumsComponent implements OnInit {
  albums: any[] = [];

  constructor(
    private musicService: MusicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.musicService.getAlbums().subscribe(albums => {
      this.albums = albums;
    });
  }
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
