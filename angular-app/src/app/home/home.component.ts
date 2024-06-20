import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  artists: any[] = [];
  albums: any[] = [];
  musics: any[] = [];

  constructor(private musicService: MusicService, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.loadArtists();
    this.loadAlbums();
    this.loadMusics();
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.d-flex-nowrap');
    sections.forEach(section => {
      this.renderer.listen(section, 'wheel', (event: WheelEvent) => {
        if (event.deltaY > 0) {
          section.scrollLeft += 100; // Ajustez cette valeur selon vos besoins
        } else {
          section.scrollLeft -= 100; // Ajustez cette valeur selon vos besoins
        }
        event.preventDefault();
      });
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
}
