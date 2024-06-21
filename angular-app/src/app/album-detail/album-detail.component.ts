import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';
import { Track } from '../models/artist.model';

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent implements OnInit {
  album: any;
  tracks: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const albumId = this.route.snapshot.paramMap.get('id');
    if (albumId) {
      this.loadAlbum(parseInt(albumId));
    }
  }

  loadAlbum(albumId: number): void {
    this.musicService.getAlbums().subscribe(albums => {
      this.album = albums.find(a => a.id === albumId);
      this.tracks = this.album ? this.album.tracks : [];
    });
  }
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  playTrack(track: Track): void {
    this.musicService.addTrack(track);
  }
}


