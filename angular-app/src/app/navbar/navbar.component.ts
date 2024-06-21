import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  searchResults: { artists: any[], albums: any[], tracks: any[] } = { artists: [], albums: [], tracks: [] };
  searchResultsVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router, private searchService: SearchService, private notificationService: NotificationService) { }

  ngOnInit(): void {
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
      this.searchResults = { artists: [], albums: [], tracks: [] };
      this.searchResultsVisible = false;
    }
  }

  navigateToArtist(id: number) {
    if (id) {
      this.router.navigate(['/artist', id]);
    } else {
      console.error('Artist ID is undefined');
      this.notificationService.showNotification('Artist ID is undefined', 'error');
    }
  }

  navigateToAlbum(id: number) {
    if (id) {
      this.router.navigate(['/album', id]);
    } else {
      console.error('Album ID is undefined');
      this.notificationService.showNotification('Album ID is undefined', 'error');
    }
  }

  navigateToAlbumByTrack(albumId: number) {
    if (albumId) {
      this.router.navigate(['/album', albumId]);
    } else {
      console.error('Album ID for track is undefined');
      this.notificationService.showNotification('Album ID for track is undefined', 'error');
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
