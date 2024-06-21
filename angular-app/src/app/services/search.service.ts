import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

interface Artist {
  id: number;
  name: string;
  pictureUrl: string;
  bio: string;
}

interface Track {
  title: string;
  duration: string;
}

interface Album {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl: string;
  tracks: Track[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8000'; // URL de votre backend PHP

  constructor(private http: HttpClient) {
  }

  search(query: string): Observable<{ artists: Artist[], albums: Album[], tracks: Track[] }> {
    return this.http.get<any>(`${this.apiUrl}/search.php?q=${query}`);
  }
}
