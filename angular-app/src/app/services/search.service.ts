import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Album, Artist, Track } from '../models/artist.model';
import { Movie } from '../models/movie.model';

/**
 * Search service
 * 
 * This service is used to manage the search.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8000'; // URL de votre backend PHP

  /**
   * Constructor
   * 
   * @param http The HTTP client
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * Search
   * 
   * It is used to search for artists, albums, tracks and movies.
   * 
   * @param query The query
   * @returns The search result
   */
  search(query: string): Observable<{ artists: Artist[], albums: Album[], tracks: Track[], movies: Movie[] }> {
    return this.http.get<any>(`${this.apiUrl}/search.php?q=${query}`);
  }
}
