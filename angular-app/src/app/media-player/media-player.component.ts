import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.css']
})
export class MediaPlayerComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;

  playVideo() {
    this.videoPlayer.nativeElement.play();
  }

  pauseVideo() {
    this.videoPlayer.nativeElement.pause();
  }

  stopVideo() {
    this.videoPlayer.nativeElement.pause();
    this.videoPlayer.nativeElement.currentTime = 0;
  }

  setVolume(event: Event) {
    const volume = (event.target as HTMLInputElement).value;
    this.videoPlayer.nativeElement.volume = volume;
  }
}
