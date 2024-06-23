import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { NotificationService } from '../services/notification.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Artist, Album, Track } from '../models/artist.model';
import { Movie } from '../models/movie.model';

/**
 * Navbar component
 * 
 * This component is used to display the navigation bar.
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  searchResults: { artists: Artist[], albums: Album[], tracks: Track[], movies: Movie[] } = { 
    artists: [], albums: [], tracks: [], movies: []
  };
  searchResultsVisible: boolean = false;

  /**
   * Constructor
   * 
   * @param authService The authentication service
   * @param router The router
   * @param searchService The search service
   * @param notificationService The notification service
   * @param horizontalScrollService The horizontal scroll service
   * @param renderer The renderer
   */
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private searchService: SearchService, 
    private notificationService: NotificationService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to initialize the component.
   */
  ngOnInit(): void {
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
   * Logout
   * 
   * It is used to log out the user.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Search
   * 
   * It is used to search for artists, albums, and tracks.
   */
  onSearch() {
    if (this.searchQuery) {
      this.searchService.search(this.searchQuery).subscribe(results => {
        this.searchResults = results;
        this.searchResultsVisible = true;
      });
    } else {
      this.searchResults = { artists: [], albums: [], tracks: [], movies: []};
      this.searchResultsVisible = false;
    }
  }

  /**
   * Navigate to the artist page
   * 
   * @param id The artist ID
   */
  navigateToArtist(id: string) {
    if (id) {
      this.router.navigate(['/artist', id]);
    } else {
      console.error('Artist ID is undefined');
      this.notificationService.showNotification('Artist ID is undefined', 'error');
    }
  }

  /**
   * Navigate to the album page
   * 
   * @param id The album ID
   */
  navigateToAlbum(id: string) {
    if (id) {
      this.router.navigate(['/album', id]);
    } else {
      console.error('Album ID is undefined');
      this.notificationService.showNotification('Album ID is undefined', 'error');
    }
  }

  /**
   * Navigate to the movie page
   * 
   * @param id The movie ID
   */
  navigateToMovie(id: string) {
    if (id) {
      this.router.navigate(['/movie', id]);
    } else {
      console.error('Movie ID is undefined');
      this.notificationService.showNotification('Movie ID is undefined', 'error');
    }
  }

  /**
   * On focus
   * 
   * It is used to show the search results when the search input is focused.
   */
  onFocus() {
    if (this.searchQuery && (this.searchResults.artists.length || this.searchResults.albums.length || this.searchResults.tracks.length)) {
      this.searchResultsVisible = true;
    }
  }

  /**
   * On blur
   * 
   * It is used to hide the search results when the search input is blurred.
   */
  onBlur() {
    setTimeout(() => {
      this.searchResultsVisible = false;
    }, 200);
  }
}
