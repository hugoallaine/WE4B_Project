import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie.model';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Router } from '@angular/router';

/**
 * Movies component
 * 
 * This component is used to display the list of movies.
 */
@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit, AfterViewInit {
  directoryPath: string = '../../video';
  movies: Movie[] = [];

  /**
   * Constructor
   * 
   * @param movieService The movie service
   * @param horizontalScrollService The horizontal scroll service
   * @param renderer The renderer
   * @param router The router
   */
  constructor(
    private movieService: MovieService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2,
    private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the movies.
   */
  ngOnInit(): void {
    this.loadMovies();
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
   * Load movies
   * 
   * It is used to load the list of movies.
   */
  loadMovies(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
    });
  }

  /**
   * Scan directory
   * 
   * It is used to scan the directory for new movies.
   */
  scanDirectory(): void {
    if (this.directoryPath) {
      this.movieService.scanDirectory(this.directoryPath).subscribe(response => {
        if (response.success) {
          this.loadMovies();
        }
      });
    }
  }

  /**
   * Navigate to the given page
   * 
   * @param page The page to navigate to
   */
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
