import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist, Album, Track } from '../models/artist.model';

type QueueItem = [Track, Album, Artist];

/**
 * Music service
 * 
 * This service is used to manage the music.
 */
@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private apiUrl = 'http://localhost:8000';
  private queueSubject: BehaviorSubject<QueueItem[]> = new BehaviorSubject<QueueItem[]>([]);
  private currentIndexSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Constructor
   * 
   * @param http The HTTP client
   */
  constructor(
    private http: HttpClient
  ) {
    const queue = this.queueSubject.value;
    queue.push([
      { id: '', title: 'Player', duration: 1, filePath: '' }, 
      { id: '', title: 'No', coverUrl: '../../assets/logo/flex-logo-gris.svg', tracks: [] }, 
      { id: '', name: 'Song', pictureUrl: '', albums: [] }
    ]);
  }

  /**
   * Get media URL
   * 
   * It is used to get the media URL for streaming the music.
   * 
   * @param path The path
   * @returns The media URL
   */
  getMediaUrl(path: string): string {
    return `${this.apiUrl}/serveMedia.php?path=${path}`;
  }

  /**
   * Get artists
   * 
   * @returns The artists
   */
  getArtists(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => data.artists || [])
    );
  }

  /**
   * Get artist
   * 
   * @param id The artist ID
   * @returns The artist
   */
  getArtist(id: string): Observable<Artist> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => data.artists.find((artist: Artist) => artist.id === id))
    );
  }

  /**
   * Get albums
   * 
   * @returns The albums
   */
  getAlbums(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => {
        let albums: any[] = [];
        data.artists.forEach((artist: Artist) => {
          albums = albums.concat(artist.albums);
        });
        return albums;
      })
    );
  }

  /**
   * Get album
   * 
   * @param id The album ID
   * @returns The album
   */
  getAlbum(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => {
        let artist = data.artists.find((artist: Artist) => artist.albums.some((album: Album) => album.id === id));
        let album = artist.albums.find((album: Album) => album.id === id);
        return [artist, album];
      })
    );
  }

  /**
   * Get tracks
   * 
   * @returns The tracks
   */
  getTracks(): Observable<Track[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
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

  /**
   * Scan directory to save new music into the database
   * 
   * @param directoryPath The directory path
   * @returns The response
   */
  scanDirectory(directoryPath: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan_directory.php`, { directoryPath });
  }

  /**
   * Add track to the queue
   * 
   * @param trackInfo The track info
   * @param playNow Play now
   */
  addTrack(trackInfo: QueueItem, playNow: boolean): void {
    const queue = this.queueSubject.value;
    queue.push(trackInfo);
    if (playNow) {
      this.queueSubject.next(queue);
      this.currentIndexSubject.next(queue.length - 1); // Update currentIndex to the last track
    }
  }

  /**
   * Add tracks to the queue
   * 
   * @param tracksInfo The tracks info
   */
  addTracks(tracksInfo: QueueItem[]) {
    const queue = this.queueSubject.value;
    queue.push(...tracksInfo);
    this.queueSubject.next(queue);
  }

  /**
   * Get queue
   * 
   * @returns The queue
   */
  getQueue(): Observable<QueueItem[]> {
    return this.queueSubject.asObservable();
  }

  /**
   * Get current track
   * 
   * @returns The current track
   */
  getCurrentTrack(): QueueItem {
    const queue = this.queueSubject.value;
    const currentIndex = this.currentIndexSubject.value;
    return queue[currentIndex];
  }

  /**
   * Get current track observable
   * 
   * @returns The current track observable
   */
  getCurrentTrackObservable(): Observable<QueueItem> {
    return this.currentIndexSubject.pipe(
      map(index => {
        const queue = this.queueSubject.value;
        return queue[index];
      })
    );
  }

  /**
   * Go to the next track
   */
  nextTrack(): void {
    let currentIndex = this.currentIndexSubject.value;
    const queueLength = this.queueSubject.value.length;
    if (currentIndex < queueLength - 1) {
      currentIndex++;
      this.currentIndexSubject.next(currentIndex);
    }
  }

  /**
   * Go to the previous track
   */
  prevTrack(): void {
    let currentIndex = this.currentIndexSubject.value;
    if (currentIndex > 0) {
      currentIndex--;
      this.currentIndexSubject.next(currentIndex);
    }
  }

  /**
   * Set track
   * 
   * @param index The index
   */
  setTrack(index: number) {
    if (index >= 0 && index < this.queueSubject.value.length) {
      this.currentIndexSubject.next(index);
    }
  }

  /**
   * Get current index
   * 
   * @returns The current index
   */
  getCurrentIndex(): Observable<number> {
    return this.currentIndexSubject.asObservable();
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queueSubject.next([]);
    this.currentIndexSubject.next(0);
  }
}
