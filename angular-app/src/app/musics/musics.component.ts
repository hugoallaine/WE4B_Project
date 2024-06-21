import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { MusicService } from '../services/music.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-musics',
  templateUrl: './musics.component.html',
  styleUrls: ['./musics.component.css']
})
export class MusicsComponent implements OnInit, AfterViewInit {
  artists: any[] = [];
  albums: any[] = [];
  tracks: any[] = [];
  directoryPath: string = '';

  constructor(
    private musicService: MusicService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadArtists();
    this.loadAlbums();
    this.loadMusics();
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  loadArtists(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }

  loadAlbums(): void {
    this.musicService.getAlbums().subscribe(albums => {
      this.albums = albums;
    });
  }

  loadMusics(): void {
    this.musicService.getMusics().subscribe(tracks => {
      this.tracks = tracks;
    });
  }

  openDirectoryPicker(): void {
    if (this.directoryPath.trim() !== '') {
      this.musicService.scanDirectory(this.directoryPath).subscribe(response => {
        if (response.success) {
          this.loadArtists();
          this.loadAlbums();
          this.loadMusics();
        }
      });
    } else {
      alert('Please enter a valid directory path.');
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
