import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MusicService } from '../services/music.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  artists: any[] = [];
  albums: any[] = [];
  musics: any[] = [];

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
    this.musicService.getMusics().subscribe(musics => {
      this.musics = musics;
    });
  }

  openDirectoryPicker(): void {
    const directoryPicker = document.getElementById('directoryPicker') as HTMLInputElement;
    directoryPicker.click();
  }

  onDirectorySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      const filePaths = Array.from(files).map(file => file.webkitRelativePath);
      this.musicService.scanDirectory(filePaths).subscribe(response => {
        if (response.success) {
          this.loadArtists();
          this.loadAlbums();
          this.loadMusics();
        }
      });
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
