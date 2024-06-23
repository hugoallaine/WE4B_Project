import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';
import { Artist } from '../models/artist.model';

/**
 * Artist detail component
 * 
 * This component is used to display the details of an artist including their albums and tracks.
 */
@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})
export class ArtistDetailComponent implements OnInit {
  artist?: Artist;

  /**
   * Constructor
   * 
   * @param route The activated route
   * @param musicService The music service
   * @param router The router
   */
  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the artist details of the artist ID passed in the URL parameter.
   */
  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.loadArtist(artistId);
    }
  }

  /**
   * Load the artist details from the API
   * 
   * @param artistId The artist ID
   */
  loadArtist(artistId: string): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artist = artists.find(a => a.id === artistId);
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
