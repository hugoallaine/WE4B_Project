import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Artist } from '../models/artist.model';
import { Router } from '@angular/router';

/**
 * Tracks component
 * 
 * This component is used to display the tracks.
 */
@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  artists: Artist[] = [];

  /**
   * Constructor
   * 
   * @param musicService The music service
   * @param router The router
   */
  constructor(
    private musicService: MusicService,
    private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the list of artists from the API.
   */
  ngOnInit(): void {
    this.loadArtists();
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
   * Navigate to a page
   * 
   * @param page The page to navigate to
   */
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
