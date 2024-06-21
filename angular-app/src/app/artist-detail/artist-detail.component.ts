import { Component, OnInit, Renderer2} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Artist } from '../models/artist.model';
import { Album } from '../models/album.model';
import { Track } from '../models/track.model';
import { Router } from '@angular/router';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})
export class ArtistDetailComponent implements OnInit {
  artist: Artist | undefined;
  artistAlbums: Album[] = [];
  artistMusics: Track[] = [];

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router,
    private renderer: Renderer2,
    private horizontalScrollService: HorizontalScrollService
  ) { }

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.loadArtist(Number(artistId));
    } else {
      console.error('Artist ID is null');
    }
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  loadArtist(id: number): void {
    this.musicService.getArtistById(id).subscribe(artist => {
      this.artist = artist;
      this.loadArtistAlbums(artist.name);
      this.loadArtistMusics(artist.name);
    });
  }

  loadArtistAlbums(artistName: string): void {
    this.musicService.getAlbums().subscribe(albums => {
      this.artistAlbums = albums.filter(album => album.artist === artistName);
    });
  }

  loadArtistMusics(artistName: string): void {
    this.musicService.getMusics().subscribe(musics => {
      this.artistMusics = musics.filter(music => music.artist === artistName);
    });
  }
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
