import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Album, Artist, Track } from '../models/artist.model';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private router: Router, private musicService: MusicService) { }

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  @ViewChild('volumeBar') volumeBar!: ElementRef;

  wrongUrl = ['/login', '/register', '/player'];
  isPlaying = false;
  isLooping = false;
  isMuted = false;
  previousVolume = 0.5;
  showPlayer = true;
  progress = 0;
  currentTrackIndex = 0;
  isLoading = false;

  trackInfo!: [Track, Album, Artist];
  private queueSubscription!: Subscription;
  private indexSubscription!: Subscription;
  private routerSubscription!: Subscription;

  ngOnInit() {
    this.queueSubscription = this.musicService.getQueue().subscribe(queue => {
      if (queue.length > 0) {
        this.trackInfo = queue[this.currentTrackIndex];
        if (this.audioPlayer && this.trackInfo[0].filePath) {
          this.playCurrentTrack();
        }
      }
    });

    this.indexSubscription = this.musicService.getCurrentIndex().subscribe(index => {
      this.currentTrackIndex = index;
      if (this.audioPlayer && this.trackInfo[0].filePath) {
        this.playCurrentTrack();
      }
    });

    this.checkUrl(); // Initial check
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkUrl();
      }
    });
  }

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

  checkUrl() {
    this.showPlayer = !this.wrongUrl.includes(this.router.url);
  }

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

  prevTrack() {
    this.musicService.prevTrack();
  }

  nextTrack() {
    this.musicService.nextTrack();
  }

  playCurrentTrack() {
    if (!this.audioPlayer || this.isLoading) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    if (this.trackInfo) {
      audio.src = this.trackInfo[0].filePath || '';
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
    }
  }

  seek(event: any) {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = (event.target.value / 100) * audio.duration;
  }

  setVolume(event: any) {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.volume = event.target.value;
  }

  toggleMute() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    this.isMuted = !this.isMuted;
    audio.muted = this.isMuted;
  }

  seekBackward() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }

  seekForward() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }

  toggleShuffle() {
    // Shuffle logic can be implemented here
  }

  toggleLoop() {
    if (!this.audioPlayer) {
      return;
    }
    this.isLooping = !this.isLooping;
    const audio = this.audioPlayer.nativeElement;
    audio.loop = this.isLooping;
  }

  updateProgressText() {
    if (!this.audioPlayer) {
      return;
    }
    const audio = this.audioPlayer.nativeElement;
    const currentTime = this.formatTime(audio.currentTime);
    const duration = this.formatTime(audio.duration);
    this.progressText.nativeElement.innerText = `${currentTime} / ${duration}`;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
