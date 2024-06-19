import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { parseBlob } from 'music-metadata-browser';

@Component({
  selector: 'app-element-cover',
  templateUrl: './element-cover.component.html',
  styleUrls: ['./element-cover.component.css']
})
export class ElementCoverComponent implements OnInit {
  @Input() filePath!: string;
  element: any = {
    name: '',
    artist: '',
    coverUrl: ''
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadMetadata(this.filePath);
  }

  async loadMetadata(filePath: string) {
    try {
      const response = await fetch(filePath);
      const blob = await response.blob();
      const metadata = await parseBlob(blob);

      this.element.name = metadata.common.title || 'Unknown Title';
      this.element.artist = metadata.common.artist || 'Unknown Artist';
      if (metadata.common.picture) {
        this.element.coverUrl = this.getCoverUrl(metadata.common.picture);
      } else {
        this.element.coverUrl = 'assets/default-cover.jpg'; // Path to a default image
      }

      // If the title, artist, or cover image is missing, search on MusicBrainz
      if (!metadata.common.title || !metadata.common.artist || !metadata.common.picture) {
        this.fetchMusicBrainzData(metadata.common.title, metadata.common.artist);
      }
    } catch (error) {
      console.error('Error reading metadata:', error);
      this.fetchMusicBrainzData();
    }
  }

  getCoverUrl(pictures: any[]): string {
    if (pictures && pictures.length > 0) {
      const { data, format } = pictures[0];
      let base64String = '';
      for (let i = 0; i < data.length; i++) {
        base64String += String.fromCharCode(data[i]);
      }
      return `data:${format};base64,${window.btoa(base64String)}`;
    }
    return 'assets/default-cover.jpg'; // Path to a default image
  }

  fetchMusicBrainzData(title?: string, artist?: string) {
    const query = `${title || ''} ${artist || ''}`.trim();
    if (query) {
      this.http.get(`https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json`).subscribe((data: any) => {
        if (data.recordings && data.recordings.length > 0) {
          const recording = data.recordings[0];
          this.element.name = recording.title;
          this.element.artist = recording['artist-credit'][0].name;

          // Search for cover images on Cover Art Archive
          if (!this.element.coverUrl || this.element.coverUrl === 'assets/default-cover.jpg') {
            this.fetchCoverArt(recording.releases[0]['release-group']['id']);
          }
        }
      });
    }
  }

  fetchCoverArt(mbId: string) {
    this.http.get(`https://coverartarchive.org/release-group/${mbId}`).subscribe((data: any) => {
      if (data.images && data.images.length > 0) {
        this.element.coverUrl = data.images[0].image;
      }
    }, error => {
      console.error('Cover Art not found', error);
    });
  }
}
