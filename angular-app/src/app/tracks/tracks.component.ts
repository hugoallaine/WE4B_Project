import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Track } from '../models/track.model';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  tracks: Track[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.loadMusics();
  }

  loadMusics(): void {
    this.musicService.getMusics().subscribe(tracks => {
      this.tracks = tracks;
    });
  }
}
