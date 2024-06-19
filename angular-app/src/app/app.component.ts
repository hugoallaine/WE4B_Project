import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  filePaths: string[] = [
    'assets/audio/song1.mp3',
    'assets/audio/song2.mp3',
    'assets/audio/song3.mp3'
  ];
}
