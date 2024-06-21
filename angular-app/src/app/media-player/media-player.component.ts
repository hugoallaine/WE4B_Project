import { Component, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.css']
})
export class MediaPlayerComponent implements AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  @ViewChild('volumeBar') volumeBar!: ElementRef;

  isPlaying: boolean = false;
  isMuted: boolean = false;
  isFullScreen = false;
  showVolume = false;
  previousVolume: number = 1; // Default volume before muting

  ngAfterViewInit() {
    this.videoPlayer.nativeElement.addEventListener('timeupdate', this.updateProgressBar.bind(this));
    this.videoPlayer.nativeElement.addEventListener('play', () => this.isPlaying = true);
    this.videoPlayer.nativeElement.addEventListener('pause', () => this.isPlaying = false);
    this.videoPlayer.nativeElement.addEventListener('volumechange', () => this.isMuted = this.videoPlayer.nativeElement.muted);
    this.videoPlayer.nativeElement.addEventListener('ended', () => this.isPlaying = false);
    this.videoPlayer.nativeElement.addEventListener('click', this.togglePlayPause.bind(this));
    this.videoPlayer.nativeElement.addEventListener('dblclick', this.toggleFullScreen.bind(this));
  }

  updateProgressBar() {
    const duration = this.videoPlayer.nativeElement.duration;
    const currentTime = this.videoPlayer.nativeElement.currentTime;
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

  seek(event: Event) {
    const seekTo = parseFloat((event.target as HTMLInputElement).value);
    const duration = this.videoPlayer.nativeElement.duration;
    if (duration > 0) {
      this.videoPlayer.nativeElement.currentTime = (seekTo / 100) * duration;
    }
  }

  togglePlayPause() {
    if (this.videoPlayer.nativeElement.paused) {
      this.videoPlayer.nativeElement.play();
    } else {
      this.videoPlayer.nativeElement.pause();
    }
  }

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

  skip(time: number) {
    this.videoPlayer.nativeElement.currentTime += time;
  }

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

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.videoPlayer.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  @HostListener('document:fullscreenchange', [])
  onFullScreenChange() {
    this.isFullScreen = !!document.fullscreenElement;
  }

  toggleSettings() {
    const settings = document.getElementById("settings");
    if (settings!.style.display === "block") {
      settings!.style.display = "none";
    } else {
      settings!.style.display = "block";
    }
  }

  exit() {
    const settings = document.getElementById("settings");
    settings!.style.display = "none";
  }
}
