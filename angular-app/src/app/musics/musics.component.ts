import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { MusicService } from '../services/music.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Router } from '@angular/router';
import { Artist, Album, Track } from '../models/artist.model';

/**
 * Musics component
 * 
 * This component is used to display the list of artists.
 */
@Component({
  selector: 'app-musics',
  templateUrl: './musics.component.html',
  styleUrls: ['./musics.component.css']
})
export class MusicsComponent implements OnInit, AfterViewInit {
  artists: Artist[] = [];
  directoryPath: string = '../../audio';

  /**
   * Constructor
   * 
   * @param musicService The music service
   * @param horizontalScrollService The horizontal scroll service
   * @param renderer The renderer
   * @param router The router
   */
  constructor(
    private musicService: MusicService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2,
    private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the artists.
   */
  ngOnInit(): void {
    this.loadArtists();
  }

  /**
   * AfterViewInit lifecycle hook
   * 
   * It is used to apply smooth horizontal scrolling to the element containers.
   */
  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  /**
   * Load artists
   * 
   * It is used to load the list of artists.
   */
  loadArtists(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }

  /**
   * Scan directory
   * 
   * It is used to scan the directory for music files.
   */
  scanDirectory(): void {
    if (this.directoryPath) {
      this.musicService.scanDirectory(this.directoryPath).subscribe(response => {
        if (response.success) {
          this.loadArtists();
        }
      });
    }
  }

  /**
   * Navigate to the specified page
   * 
   * @param page The page name
   */
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
