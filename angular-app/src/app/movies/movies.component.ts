import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie.model';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit, AfterViewInit {
  directoryPath: string = '../../video';
  movies: Movie[] = [];

  constructor(
    private movieService: MovieService, 
    private horizontalScrollService: HorizontalScrollService, 
    private renderer: Renderer2,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
    });
  }

  scanDirectory(): void {
    if (this.directoryPath) {
      this.movieService.scanDirectory(this.directoryPath).subscribe(response => {
        if (response.success) {
          this.loadMovies();
        }
      });
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
