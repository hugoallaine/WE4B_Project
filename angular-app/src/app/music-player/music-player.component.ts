import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Track } from '../models/artist.model';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements OnInit, AfterViewInit {

  constructor(private router: Router, private musicService: MusicService) { }

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  @ViewChild('volumeBar') volumeBar!: ElementRef;

  wrongUrl = ['/login', '/register', '/player'];
  isPlaying = false;
  isLooping = false;
  isMuted = false;
  previousVolume = 1;
  showPlayer = true;
  progress = 0;
  currentTrackIndex = 0;

  track?: Track;

  private routerSubscription!: Subscription;

  ngOnInit() {
    this.track = this.musicService.getCurrentTrack();
    this.checkUrl(); // Initial check
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkUrl();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  checkUrl() {
    if (this.wrongUrl.includes(this.router.url)) {
      this.showPlayer = false;
    } else {
      this.showPlayer = true;
    }
  }

  ngAfterViewInit() {
    const audio = this.audioPlayer.nativeElement;
    audio.autoplay = true;
    audio.addEventListener('timeupdate', () => {
      this.progress = (audio.currentTime / audio.duration) * 100;
      this.updateProgressText();
    });
    audio.addEventListener('ended', () => {
      this.nextTrack();
    });
  }

  updateProgressBar() {
    const duration = this.audioPlayer.nativeElement.duration;
    const currentTime = this.audioPlayer.nativeElement.currentTime;
    if (duration > 0) {
      this.progressBar.nativeElement.value = (currentTime / duration) * 100;
      const formattedDurationMin = Math.floor(duration / 60).toString().padStart(2, '0');
      const formattedDurationSec = Math.floor(duration % 60).toString().padStart(2, '0');
      const formattedCurrentMin = Math.floor(currentTime / 60).toString().padStart(2, '0');
      const formattedCurrentSec = Math.floor(currentTime % 60).toString().padStart(2, '0');
      const formattedCurrentTime = `${formattedCurrentMin}:${formattedCurrentSec}`;
      const formattedDurationTime = `${formattedDurationMin}:${formattedDurationSec}`;
      this.progressText.nativeElement.textContent = `${formattedCurrentTime} / ${formattedDurationTime}`;
    }
  }

  togglePlayPause() {
    const audio = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  prevTrack() {
    this.track = this.musicService.prevTrack();
    this.playCurrentTrack();
  }

  nextTrack() {
    this.track = this.musicService.nextTrack();
    this.playCurrentTrack();
  }

  playCurrentTrack() {
    const audio = this.audioPlayer.nativeElement;
    audio.src = this.track?.filePath || '';
    audio.play();
    this.isPlaying = true;
  }

  seek(event: any) {
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = (event.target.value / 100) * audio.duration;
  }

  setVolume(event: any) {
    const audio = this.audioPlayer.nativeElement;
    audio.volume = event.target.value;
  }

  toggleMute() {
    const audio = this.audioPlayer.nativeElement;
    this.isMuted = !this.isMuted;
    audio.muted = this.isMuted;
  }

  seekBackward() {
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }

  seekForward() {
    const audio = this.audioPlayer.nativeElement;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }

  toggleShuffle() {
    // Shuffle logic can be implemented here
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    const audio = this.audioPlayer.nativeElement;
    audio.loop = this.isLooping;
  }

  updateProgressText() {
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
