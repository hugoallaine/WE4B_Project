import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Movie } from '../models/movie.model';

/**
 * Movie service
 * 
 * This service is used to manage the movies.
 */
@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8000';

  /**
   * Constructor
   * 
   * @param http The HTTP client
   */
  constructor(
    private http: HttpClient
  ) { }

  /**
   * Get media URL
   * 
   * It is used to get the media URL for streaming the movie.
   * 
   * @param path The path
   * @returns The media URL
   */
  getMediaUrl(path: string): string {
    return `${this.apiUrl}/serveMedia.php?path=${path}`;
  }
  
  /**
   * Get movies
   * 
   * It is used to get the movies.
   * 
   * @returns The movies
   */
  getMovies(): Observable<Movie[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=movies`).pipe(
      map(data => data.movies || [])
    );
  }

  /**
   * Scan directory to save new movies into the database
   * 
   * @param directoryPath The directory path
   * @returns The response
   */
  scanDirectory(directoryPath: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan_directory_movies.php`, { directoryPath });
  }
}
