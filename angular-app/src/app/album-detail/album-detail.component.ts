import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';
import { Album, Artist, Track } from '../models/artist.model';

/**
 * Album detail component
 * 
 * This component is used to display the details of an album including its tracks.
 */
@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent implements OnInit {
  artist: Artist = {
    id: '',
    name: '',
    pictureUrl: '',
    albums: []
  };

  album: Album = {
    id: '',
    title: '',
    coverUrl: '',
    tracks: []
  };

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
   * It is used to load the album details of the album ID passed in the URL parameter.
   */
  ngOnInit(): void {
    const albumId = this.route.snapshot.paramMap.get('id');
    if (albumId) {
      this.loadAlbum(albumId);
    }
  }

  /**
   * Load the album details from the API
   * 
   * @param albumId The album ID
   */
  loadAlbum(albumId: string): void {
    this.musicService.getAlbum(albumId).subscribe(data => {
      this.artist = data[0]
      this.album = data[1];
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

  /**
   * Play a track
   * 
   * @param track The track to play
   * @param album The album of the track
   * @param artist The artist of the track
   */
  playTrack(track: Track, album: Album, artist: Artist): void {
    this.musicService.addTrack([track, album, artist], true);
  }
}