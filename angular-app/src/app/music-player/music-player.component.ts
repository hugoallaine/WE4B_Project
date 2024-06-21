import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements OnInit, AfterViewInit {
  
  constructor(private router: Router) {}

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  @ViewChild('volumeBar') volumeBar!: ElementRef;

  isPlaying = false;
  isLooping = false;
  isMuted = false;
  showVolume = false;
  previousVolume = 1;

  progress = 0;
  tracks = ['song1.mp3', 'song2.mp3', 'song3.mp3'];
  currentTrackIndex = 0;
  type = 'audio/mp3';
  path = '/assets/audio';
  trackpath = this.path + '/' + this.tracks[this.currentTrackIndex];

  ngOnInit() {
    setTimeout(() => {
      console.log(this.router.url);
    }, 500); // Délai de 500 ms
  }

  ngAfterViewInit() {
    this.audioPlayer.nativeElement.autoplay = true;
    this.audioPlayer.nativeElement.addEventListener('timeupdate', this.updateProgressBar.bind(this));
    this.audioPlayer.nativeElement.addEventListener('play', () => this.isPlaying = true);
    this.audioPlayer.nativeElement.addEventListener('pause', () => this.isPlaying = false);
    this.audioPlayer.nativeElement.addEventListener('volumechange', () => this.isMuted = this.audioPlayer.nativeElement.muted);
    this.audioPlayer.nativeElement.addEventListener('ended', () => this.isPlaying = false);
    this.audioPlayer.nativeElement.addEventListener('click', this.togglePlayPause.bind(this));
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

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.playCurrentTrack();
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.playCurrentTrack();
  }

  seek(event: Event) {
    const progressBar = event.target as HTMLInputElement;
    const clickPosition = parseFloat(progressBar.value) / 100;
    this.audioPlayer.nativeElement.currentTime = clickPosition * this.audioPlayer.nativeElement.duration;
  }

  seekForward() {
    this.audioPlayer.nativeElement.currentTime += 10;
  }

  seekBackward() {
    this.audioPlayer.nativeElement.currentTime -= 10;
  }

  setVolume(event: Event) {
    const volume = parseFloat((event.target as HTMLInputElement).value);
    this.audioPlayer.nativeElement.volume = volume;
    if (volume === 0) {
      this.audioPlayer.nativeElement.muted = true;
    } else {
      this.audioPlayer.nativeElement.muted = false;
      this.previousVolume = volume;
    }
    this.isMuted = this.audioPlayer.nativeElement.muted;
  }

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

  playCurrentTrack() {
    const audio = this.audioPlayer.nativeElement;
    audio.src = this.path + '/' + this.tracks[this.currentTrackIndex];
    audio.play();
    this.isPlaying = true;
  }

  updateProgress() {
    const audio = this.audioPlayer.nativeElement;
    this.progress = (audio.currentTime / audio.duration) * 100;
  }

  toggleLoop() {
    this.audioPlayer.nativeElement.loop = !this.audioPlayer.nativeElement.loop;
    this.isLooping = !this.isLooping;
  }

  toggleShuffle() {
    this.tracks = (this.tracks);
    this.currentTrackIndex = 0;
    this.playCurrentTrack();
  }

}
