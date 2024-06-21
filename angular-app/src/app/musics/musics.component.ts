import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { MusicService } from '../services/music.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Router } from '@angular/router';
import { Artist, Album, Track } from '../models/artist.model';

@Component({
  selector: 'app-musics',
  templateUrl: './musics.component.html',
  styleUrls: ['./musics.component.css']
})
export class MusicsComponent implements OnInit, AfterViewInit {
  artists: Artist[] = [];
  directoryPath: string = '';

  constructor(
    private musicService: MusicService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadArtists();
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


  scanDirectory(): void {
    if (this.directoryPath) {
      this.musicService.scanDirectory(this.directoryPath).subscribe(response => {
        if (response.success) {
          this.loadArtists();
        }
      });
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
