import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Album, Artist, Track } from '../models/artist.model';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8000'; // URL de votre backend PHP

  constructor(private http: HttpClient) {
  }

  search(query: string): Observable<{ artists: Artist[], albums: Album[], tracks: Track[], movies: Movie[] }> {
    return this.http.get<any>(`${this.apiUrl}/search.php?q=${query}`);
  }
}
