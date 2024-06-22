import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist, Album, Track } from '../models/artist.model';

type QueueItem = [Track, Album, Artist];

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private apiUrl = 'http://localhost:8000';
  private queueSubject: BehaviorSubject<QueueItem[]> = new BehaviorSubject<QueueItem[]>([]);
  private currentIndexSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    const queue = this.queueSubject.value;
    queue.push([
      { id: '', title: 'Player', duration: 1, filePath: '' }, 
      { id: '', title: 'No', coverUrl: '../../assets/logo/flex-logo-gris.svg', tracks: [] }, 
      { id: '', name: 'Song', pictureUrl: '', albums: [] }
    ]);
  }

  getArtists(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => data.artists || [])
    );
  }

  getArtist(id: string): Observable<Artist> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => data.artists.find((artist: Artist) => artist.id === id))
    );
  }

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

  getAlbum(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=musics`).pipe(
      map(data => {
        let artist = data.artists.find((artist: Artist) => artist.albums.some((album: Album) => album.id === id));
        let album = artist.albums.find((album: Album) => album.id === id);
        return [artist, album];
      })
    );
  }

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

  scanDirectory(directoryPath: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan_directory.php`, { directoryPath });
  }

  addTrack(trackInfo: QueueItem, playNow: boolean): void {
    const queue = this.queueSubject.value;
    queue.push(trackInfo);
    if (playNow) {
      this.queueSubject.next(queue);
      this.currentIndexSubject.next(queue.length - 1); // Update currentIndex to the last track
      console.log('Playing track:', trackInfo[0].title)
      console.log('queueIndex:', queue.length - 1)
      console.log('queue:', queue)
    }
  }

  addTracks(tracksInfo: QueueItem[]) {
    const queue = this.queueSubject.value;
    queue.push(...tracksInfo);
    this.queueSubject.next(queue);
  }

  getQueue(): Observable<QueueItem[]> {
    return this.queueSubject.asObservable();
  }

  getCurrentTrack(): QueueItem {
    const queue = this.queueSubject.value;
    const currentIndex = this.currentIndexSubject.value;
    return queue[currentIndex];
  }

  getCurrentTrackObservable(): Observable<QueueItem> {
    return this.currentIndexSubject.pipe(
      map(index => {
        const queue = this.queueSubject.value;
        return queue[index];
      })
    );
  }

  nextTrack(): void {
    let currentIndex = this.currentIndexSubject.value;
    const queueLength = this.queueSubject.value.length;
    if (currentIndex < queueLength - 1) {
      currentIndex++;
      this.currentIndexSubject.next(currentIndex);
    }
    console.log('queueIndex:', this.currentIndexSubject.value)
    console.log('queue:', this.queueSubject.value)
  }

  prevTrack(): void {
    let currentIndex = this.currentIndexSubject.value;
    if (currentIndex > 0) {
      currentIndex--;
      this.currentIndexSubject.next(currentIndex);
    }
    console.log('queueIndex:', this.currentIndexSubject.value)
    console.log('queue:', this.queueSubject.value)
  }

  setTrack(index: number) {
    if (index >= 0 && index < this.queueSubject.value.length) {
      this.currentIndexSubject.next(index);
    }
  }

  getCurrentIndex(): Observable<number> {
    return this.currentIndexSubject.asObservable();
  }

  clearQueue(): void {
    this.queueSubject.next([]);
    this.currentIndexSubject.next(0);
  }
}
