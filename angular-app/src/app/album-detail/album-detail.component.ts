import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Album } from '../models/album.model';
import { Track } from '../models/track.model';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent implements OnInit {
  album: Album | undefined;

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2,
    private router: Router
  ) { }

  ngOnInit(): void {
    const albumId = Number(this.route.snapshot.paramMap.get('id'));
    if (albumId) {
      this.loadAlbum(albumId);
    }
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  loadAlbum(albumId: number): void {
    this.musicService.getAlbumById(albumId).subscribe(album => {
      this.album = album;
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  playTrack(track: Track): void {
    this.musicService.addTrack(track);
  }
}