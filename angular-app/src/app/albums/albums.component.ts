import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Album } from '../models/album.model';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class AlbumsComponent implements OnInit {

  albums: Album[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.musicService.getAlbums().subscribe(data => {
      this.albums = data;
    });
  }
}
