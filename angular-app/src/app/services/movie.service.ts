import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getMediaUrl(path: string): string {
    return `${this.apiUrl}/serveMedia.php?path=${path}`;
  }
  
  getMovies(): Observable<Movie[]> {
    return this.http.get<any>(`${this.apiUrl}/get_data.php?type=movies`).pipe(
      map(data => data.movies || [])
    );
  }

  scanDirectory(directoryPath: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan_directory_movies.php`, { directoryPath });
  }
}
