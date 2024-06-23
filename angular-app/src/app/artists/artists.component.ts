import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';

/**
 * Artists component
 * 
 * This component is used to display the list of all artists on the platform.
 */
@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.css']
})
export class ArtistsComponent implements OnInit {
  artists: any[] = [];

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

  ngOnInit(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
