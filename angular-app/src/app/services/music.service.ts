import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist, Album, Track } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getArtists(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => data.artists || [])
    );
  }

  getAlbums(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => {
        let albums: any[] = [];
        data.artists.forEach((artist:  Artist) => {
          albums = albums.concat(artist.albums);
        });
        return albums;
      })
    );
  }

getTracks(): Observable<Track[]> {
    return this.http.get<{ artists: Artist[] }>(`${this.apiUrl}/get_data.php`).pipe(
      map(data => {
        let musics: Track[] = [];
        data.artists.forEach((artist: Artist) => {
          artist.albums.forEach((album: Album) => {
            musics = musics.concat(album.tracks);
          });
        });
        return musics;
      })
    );
}
  scanDirectory(directoryPath: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan_directory.php`, { directoryPath });
  }
}
