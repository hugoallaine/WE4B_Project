import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { Track } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getAlbums(): Observable<Album[]> {
    return this.http.get<{albums: Album[]}>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => data.albums ?? [])
    );
  }

  getAlbumById(albumId: number): Observable<Album> {
    return this.http.get<{ album: Album }>(`${this.apiUrl}/get_album.php?albumId=${albumId}`).pipe(
      map(response => response.album)
    );
  }

  getMusics(): Observable<Track[]> {
    return this.http.get<{tracks: Track[]}>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => data.tracks ?? [])
    );
  }

  getArtists(): Observable<Artist[]> {
    return this.http.get<{artists: Artist[]}>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => data.artists ?? [])
    );
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<{artists: Artist[]}>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => data.artists.find(artist => artist.id === id)!)
    );
  }

  scanDirectory(filePaths: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan_directory.php`, { filePaths });
  }
}
