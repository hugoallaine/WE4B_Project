import { Component, ViewChild, ElementRef, HostListener, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie.model';

/**
 * Media player component
 * 
 * This component is used to play movies and TV shows.
 */
@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.css']
})
export class MediaPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  @ViewChild('volumeBar') volumeBar!: ElementRef;

  movie?: Movie;
  isPlaying: boolean = false;
  isMuted: boolean = false;
  isFullScreen: boolean = false;
  previousVolume: number = 1; // Default volume before muting

  /**
   * Constructor
   * 
   * @param route The activated route
   * @param movieService The movie service
   * @param router The router
   */
  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to load the movie details of the movie ID passed in the URL parameter.
   */
  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovie(parseInt(movieId));
    }
  }

  /**
   * AfterViewInit lifecycle hook
   * 
   * It is used to add event listeners to the video player.
   */
  ngAfterViewInit() {
    this.videoPlayer.nativeElement.autoplay = true;
    this.videoPlayer.nativeElement.addEventListener('timeupdate', this.updateProgressBar.bind(this));
    this.videoPlayer.nativeElement.addEventListener('play', () => this.isPlaying = true);
    this.videoPlayer.nativeElement.addEventListener('pause', () => this.isPlaying = false);
    this.videoPlayer.nativeElement.addEventListener('ended', () => this.isPlaying = false);
    this.videoPlayer.nativeElement.addEventListener('click', this.togglePlayPause.bind(this));
    this.videoPlayer.nativeElement.addEventListener('dblclick', this.toggleFullScreen.bind(this));
  }

  /**
   * Load the movie details from the API
   * 
   * @param movieId The movie ID
   */
  loadMovie(movieId: number): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movie = movies.find(a => parseInt(a.id) === movieId);
      if (this.movie && this.movie.filePath) {
        this.videoPlayer.nativeElement.src = this.movieService.getMediaUrl(this.movie?.filePath || '');
      }
    });
  }

  /**
   * Update the progress bar
   */
  updateProgressBar() {
    const videoElement = this.videoPlayer.nativeElement;
    const progressBarElement = this.progressBar.nativeElement;
    const progressTextElement = this.progressText.nativeElement;

    const duration = videoElement.duration;
    const currentTime = videoElement.currentTime;

    if (duration > 0) {
      progressBarElement.value = (currentTime / duration) * 100;
      progressTextElement.textContent = `${this.formatTime(currentTime, duration)} / ${this.formatTime(duration, duration)}`;
    }
  }

  /**
   * Format the time in seconds to HH:MM:SS or MM:SS format
   * 
   * @param timeInSeconds The time in seconds
   * @param totalDuration The total duration of the video
   * @returns The formatted time
   */
  formatTime(timeInSeconds: number, totalDuration: number) {
    const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');

    // Check if totalDuration is greater than an hour
    if (totalDuration >= 3600) {
      return `${hours}:${minutes}:${seconds}`;
    } else {
      return `${minutes}:${seconds}`;
    }
  }

  /**
   * Seek to a specific time in the video
   * 
   * @param event The event
   */
  seek(event: Event) {
    const seekTo = parseFloat((event.target as HTMLInputElement).value);
    const duration = this.videoPlayer.nativeElement.duration;
    if (duration > 0) {
      this.videoPlayer.nativeElement.currentTime = (seekTo / 100) * duration;
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause() {
    if (this.videoPlayer.nativeElement.paused) {
      this.videoPlayer.nativeElement.play();
    } else {
      this.videoPlayer.nativeElement.pause();
    }
  }

  /**
   * Toggle mute/unmute
   */
  toggleMute() {
    if (this.videoPlayer.nativeElement.muted) {
      this.videoPlayer.nativeElement.muted = false;
      this.videoPlayer.nativeElement.volume = this.previousVolume;
      this.volumeBar.nativeElement.value = this.previousVolume;
    } else {
      this.previousVolume = this.videoPlayer.nativeElement.volume;
      this.videoPlayer.nativeElement.muted = true;
      this.volumeBar.nativeElement.value = 0;
    }
    this.isMuted = this.videoPlayer.nativeElement.muted;
  }

  /**
   * Toggle play/pause
   * 
   * @param time The time to skip
   */
  skip(time: number) {
    this.videoPlayer.nativeElement.currentTime += time;
  }

  /**
   * Set the volume
   * 
   * @param event The event
   */
  setVolume(event: Event) {
    const volume = parseFloat((event.target as HTMLInputElement).value);
    this.videoPlayer.nativeElement.volume = volume;
    if (volume === 0) {
      this.videoPlayer.nativeElement.muted = true;
    } else {
      this.videoPlayer.nativeElement.muted = false;
      this.previousVolume = volume;
    }
    this.isMuted = this.videoPlayer.nativeElement.muted;
  }

  /**
   * Toggle full screen
   */
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.videoPlayer.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Full screen change event listener
   */
  @HostListener('document:fullscreenchange', [])
  onFullScreenChange() {
    this.isFullScreen = !!document.fullscreenElement;
  }

  /**
   * Set the playback rate
   * 
   * @param event The event
   */
  setPlaybackRate(event: Event) {
    const playbackRate = parseFloat((event.target as HTMLSelectElement).value);
    this.videoPlayer.nativeElement.playbackRate = playbackRate;
  }

  /**
   * Toggle subtitles
   * 
   * @param event The event
   */
  toggleSubtitles(event: Event) {
    const tracks = this.videoPlayer.nativeElement.textTracks;
    if ((event.target as HTMLInputElement).checked) {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'showing';
      }
    } else {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden';
      }
    }
  }

  /**
   * Set the language of the subtitles
   * 
   * @param event The event
   */
  setLanguage(event: Event) {
    const language = (event.target as HTMLSelectElement).value;
    const tracks = this.videoPlayer.nativeElement.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = tracks[i].language === language ? 'showing' : 'hidden';
    }
  }

  /**
   * Navigate to a specific page
   * 
   * @param page The page to navigate to
   */
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}