import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie.model';

/**
 * Movie detail component
 * 
 * This component is used to display the details of a movie.
 */
@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  movie?: Movie;

  /**
   * Constructor
   * 
   * @param route The activated route
   * @param movieService The movie service
   * @param router The router
   */
  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the movie details of the movie ID passed in the URL parameter.
   */
  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovie(parseInt(movieId));
    }
  }

  /**
   * Load movie
   * 
   * It is used to load the movie details of the given movie ID.
   * 
   * @param movieId The movie ID
   */
  loadMovie(movieId: number): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movie = movies.find(a => parseInt(a.id) === movieId);
    });
  }

  /**
   * Navigate to page
   * 
   * It is used to navigate to the given page.
   * 
   * @param page The page to navigate to
   */
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
