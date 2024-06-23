import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { NotificationService } from '../services/notification.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';
import { Artist, Album, Track } from '../models/artist.model';
import { Movie } from '../models/movie.model';

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

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private searchService: SearchService, 
    private notificationService: NotificationService,
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

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

  navigateToArtist(id: string) {
    if (id) {
      this.router.navigate(['/artist', id]);
    } else {
      console.error('Artist ID is undefined');
      this.notificationService.showNotification('Artist ID is undefined', 'error');
    }
  }

  navigateToAlbum(id: string) {
    if (id) {
      this.router.navigate(['/album', id]);
    } else {
      console.error('Album ID is undefined');
      this.notificationService.showNotification('Album ID is undefined', 'error');
    }
  }

  navigateToMovie(id: string) {
    if (id) {
      this.router.navigate(['/movie', id]);
    } else {
      console.error('Movie ID is undefined');
      this.notificationService.showNotification('Movie ID is undefined', 'error');
    }
  }

  onFocus() {
    if (this.searchQuery && (this.searchResults.artists.length || this.searchResults.albums.length || this.searchResults.tracks.length)) {
      this.searchResultsVisible = true;
    }
  }

  onBlur() {
    setTimeout(() => {
      this.searchResultsVisible = false;
    }, 200);
  }
}
