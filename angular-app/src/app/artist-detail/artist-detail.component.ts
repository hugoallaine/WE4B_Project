import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../services/music.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})
export class ArtistDetailComponent implements OnInit {
  artist: any;
  albums: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.loadArtist(parseInt(artistId));
    }
  }

  loadArtist(artistId: number): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artist = artists.find(a => a.id === artistId);
      this.albums = this.artist ? this.artist.albums : [];
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
