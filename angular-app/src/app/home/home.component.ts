import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MusicService } from '../services/music.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Artist } from '../models/artist.model';
import { Movie } from '../models/movie.model';
import { MovieService } from '../services/movie.service';

/**
 * Home component
 * 
 * This component is used to display the home page of the platform.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  artists: Artist[] = [];
  movies: Movie[] = [];

  /**
   * Constructor
   * 
   * @param musicService The music service
   * @param movieService The movie service
   * @param horizontalScrollService The horizontal scrollbar service
   * @param renderer The renderer
   * @param router The router
   */
  constructor(
    private musicService: MusicService,
    private movieService: MovieService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2, private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the artists and movies when the component is initialized.
   */
  ngOnInit(): void {
    this.loadArtists();
    this.loadMovies();
  }

  /**
   * AfterViewInit lifecycle hook
   * 
   * It is used to apply the smooth scroll effect to the horizontal scroll sections.
   */
  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  /**
   * Load the list of artists from the API
   */
  loadArtists(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }

  /**
   * Load the list of movies from the API
   */
  loadMovies(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
    });
  }

  /**
   * Navigate to a page
   * 
   * @param page The page to navigate to
   */
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
