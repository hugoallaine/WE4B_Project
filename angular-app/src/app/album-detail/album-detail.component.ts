import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';
import { Album, Artist, Track } from '../models/artist.model';

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent implements OnInit {
  artist: Artist = {
    id: '',
    name: '',
    pictureUrl: '',
    albums: []
  };

  album: Album = {
    id: '',
    title: '',
    coverUrl: '',
    tracks: []
  };

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const albumId = this.route.snapshot.paramMap.get('id');
    if (albumId) {
      this.loadAlbum(albumId);
    }
  }

  loadAlbum(albumId: string): void {
    this.musicService.getAlbum(albumId).subscribe(data => {
      this.artist = data[0]
      this.album = data[1];
    });
  }
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  playTrack(track: Track, album: Album, artist: Artist): void {
    this.musicService.addTrack([track,album,artist], true);
  }
}


