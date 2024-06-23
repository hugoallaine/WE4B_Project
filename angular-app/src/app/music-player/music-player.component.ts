import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Album, Artist, Track } from '../models/artist.model';
import { MusicService } from '../services/music.service';

/**
 * Music player component
 * 
 * This component is used to display the music player.
 */
@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  @ViewChild('volumeBar') volumeBar!: ElementRef;

  isPlaying = false;
  isLoading = false;
  isLooping = false;
  isMuted = false;
  previousVolume = 0.5;
  showPlayer = true;
  progress = 0;

  trackInfo!: [Track, Album, Artist];
  private queueSubscription!: Subscription;
  private indexSubscription!: Subscription;
  private routerSubscription!: Subscription;

  /**
   * Constructor
   * 
   * @param router The router
   * @param musicService The music service
   */
  constructor(
    private router: Router,
    private musicService: MusicService
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to subscribe to the queue and index observables.
   */
  ngOnInit() {
    this.queueSubscription = this.musicService.getCurrentTrackObservable().subscribe(trackInfo => {
      this.trackInfo = trackInfo;
      this.playCurrentTrack();
    });

    this.checkUrl(); // Initial check
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkUrl();
      }
    });
  }

  /**
   * OnDestroy lifecycle hook
   * 
   * It is used to unsubscribe from the observables.
   */
  ngOnDestroy() {
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }
    if (this.indexSubscription) {
      this.indexSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * AfterViewInit lifecycle hook
   * 
   * It is used to add event listeners to the audio player.
   */
  ngAfterViewInit() {
    const audio = this.audioPlayer.nativeElement;
    audio.volume = this.previousVolume;
    this.volumeBar.nativeElement.value = this.previousVolume;
    audio.autoplay = false;
    audio.addEventListener('timeupdate', () => {
      this.progress = (audio.currentTime / audio.duration) * 100;
      this.updateProgressText();
    });
    audio.addEventListener('ended', () => {
      this.nextTrack();
    });
  }

  /**
   * Check the URL to determine if the player should be visible
   */
  checkUrl() {
    const wrongUrlPatterns = [
      /^\/login$/,
      /^\/register$/,
      /^\/player\/.+$/
    ];
    const isWrongUrl = wrongUrlPatterns.some(pattern => pattern.test(this.router.url));
    this.showPlayer = !isWrongUrl;
  }

  /**
   * Update the progress bar
   */
  updateProgressBar() {
    if (!this.audioPlayer) {
      return;
    }
    const duration = this.audioPlayer.nativeElement.duration;
    const currentTime = this.audioPlayer.nativeElement.currentTime;
    if (duration > 0) {
      this.progressBar.nativeElement.value = (currentTime / duration) * 100;
      this.updateProgressText();
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  /**
   * Load the previous track
   */
  prevTrack() {
    this.isLoading = false;
    this.musicService.prevTrack();
  }

  /**
   * Load the next track
   */
  nextTrack() {
    this.isLoading = false;
    this.musicService.nextTrack();
  }

  /**
   * Play the current track of the queue
   */
  playCurrentTrack() {
    if (!this.audioPlayer || this.isLoading || !this.progressText) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    if (this.trackInfo) {
      audio.src = this.musicService.getMediaUrl(this.trackInfo[0].filePath) || '';
      audio.load(); // Ensure the audio element reloads the new source
      this.isLoading = true;
      audio.oncanplaythrough = () => {
        this.isLoading = false;
        if (this.trackInfo[0].filePath) {
          audio.play().catch(error => {
            console.error('Error playing audio', error);
          });
          this.isPlaying = true;
        } else {
          this.isPlaying = false;
        }
      };
    } else {
      audio.pause();
      audio.src = '';
      this.isPlaying = false;
      this.isLoading = false;
    }
  }

  /**
   * Seek the audio
   * @param event The event
   */
  seek(event: any) {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = (event.target.value / 100) * audio.duration;
  }

  /**
   * Set the volume
   * @param event The event
   */
  setVolume(event: any) {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.volume = event.target.value;
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    if (this.audioPlayer.nativeElement.muted) {
      this.audioPlayer.nativeElement.muted = false;
      this.audioPlayer.nativeElement.volume = this.previousVolume;
      this.volumeBar.nativeElement.value = this.previousVolume;
    } else {
      this.previousVolume = this.audioPlayer.nativeElement.volume;
      this.audioPlayer.nativeElement.muted = true;
      this.volumeBar.nativeElement.value = 0;
    }
    this.isMuted = this.audioPlayer.nativeElement.muted;
  }

  /**
   * Seek backward
   */
  seekBackward() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }

  /**
   * Seek forward
   */
  seekForward() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }

  /**
   * Toggle shuffle
   */
  toggleShuffle() {
    // TODO: Implement shuffle
  }

  /**
   * Toggle loop
   */
  toggleLoop() {
    if (!this.audioPlayer) {
      return;
    }
    this.isLooping = !this.isLooping;
    const audio = this.audioPlayer.nativeElement;
    audio.loop = this.isLooping;
  }

  /**
   * Update the progress text
   */
  updateProgressText() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    const currentTime = this.formatTime(audio.currentTime);
    const duration = this.formatTime(audio.duration);
    this.progressText.nativeElement.innerText = `${currentTime} / ${duration}`;
  }

  /**
   * Format time
   * @param seconds The seconds
   * @returns The formatted time
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
