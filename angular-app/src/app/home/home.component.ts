import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  filePaths: string[] = [
    'assets/audio/song1.mp3',
    'assets/audio/song2.mp3',
    'assets/audio/song3.mp3'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
