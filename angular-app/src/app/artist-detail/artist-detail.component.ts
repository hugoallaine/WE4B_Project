import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';
import { Artist } from '../models/artist.model';

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})
export class ArtistDetailComponent implements OnInit {
  artist?: Artist;

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.loadArtist(artistId);
    }
  }

  loadArtist(artistId: string): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artist = artists.find(a => a.id === artistId);
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
