import { Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements OnInit {
  
  constructor(private router: Router) {}

    ngOnInit() {
      setTimeout(() => {
        console.log(this.router.url);
      }, 500); // Délai de 500 ms
    }

  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>; // Utiliser '!' pour indiquer que la propriété sera initialisée plus tard
  isPlaying = false;
  isFullscreen = false;
  progress = 0;
  tracks = ['track1.mp3', 'track2.mp3', 'track3.mp3'];
  currentTrackIndex = 0;
  wrongUrl = ['player', '/login', '/register'];
  

  togglePlayPause() {
    const audio = this.audioElement.nativeElement;
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

  seek(event: MouseEvent) {
    const progressBar = event.currentTarget as HTMLElement;
    const clickPosition = event.offsetX / progressBar.clientWidth;
    this.audioElement.nativeElement.currentTime = clickPosition * this.audioElement.nativeElement.duration;
  }

  seekForward() {
    this.audioElement.nativeElement.currentTime += 10;
  }

  seekBackward() {
    this.audioElement.nativeElement.currentTime -= 10;
  }

  playCurrentTrack() {
    const audio = this.audioElement.nativeElement;
    audio.src = this.tracks[this.currentTrackIndex];
    audio.play();
    this.isPlaying = true;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  updateProgress() {
    const audio = this.audioElement.nativeElement;
    this.progress = (audio.currentTime / audio.duration) * 100;
  }
}
