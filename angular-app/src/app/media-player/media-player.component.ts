import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.css']
})

export class MediaPlayerComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('progressText') progressText!: ElementRef;
  
  isPlaying: boolean = false;
  isMuted: boolean = false;

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
    this.videoPlayer.nativeElement.muted = !this.videoPlayer.nativeElement.muted;
  }


  skip(time : number) {
    this.videoPlayer.nativeElement.currentTime += time;
  }

  setVolume(event: Event) {
    const volume = (event.target as HTMLInputElement).value;
    this.videoPlayer.nativeElement.volume = volume;
    if (this.videoPlayer.nativeElement.volume == 0) {
      this.videoPlayer.nativeElement.muted = true;
    } else {
      this.videoPlayer.nativeElement.muted = false;
    }
  }

  toggleFullScreen() {
    if (this.videoPlayer.nativeElement.requestFullscreen) {
      this.videoPlayer.nativeElement.requestFullscreen();
    } else if (this.videoPlayer.nativeElement.mozRequestFullScreen) {
      this.videoPlayer.nativeElement.mozRequestFullScreen();
    } else if (this.videoPlayer.nativeElement.webkitRequestFullscreen) {
      this.videoPlayer.nativeElement.webkitRequestFullscreen();
    } else if (this.videoPlayer.nativeElement.msRequestFullscreen) {
      this.videoPlayer.nativeElement.msRequestFullscreen();
    }
  }

  toggleSettings(){
    const settings = document.getElementById("settings");
    if (settings!.style.display === "block") {
      settings!.style.display = "none";
    } else {
      settings!.style.display = "block";
    }
  }
  
}
