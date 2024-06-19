import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { Album } from '../models/album.model';
import { Music } from '../models/music.model';
import { Artist } from '../models/artist.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  artists: Artist[] = [];
  albums: Album[] = [];
  musics: Music[] = [];
  filePaths: string[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.getArtists();
    this.getAlbums();
    this.getMusics();
  }

  getArtists(): void {
    this.musicService.getArtists().subscribe(data => {
      this.artists = data;
    });
  }

  getAlbums(): void {
    this.musicService.getAlbums().subscribe(data => {
      this.albums = data;
    });
  }

  getMusics(): void {
    this.musicService.getMusics().subscribe(data => {
      this.musics = data;
    });
  }

  openDirectoryPicker(): void {
    const directoryPicker = document.getElementById('directoryPicker') as HTMLInputElement;
    directoryPicker.click();
  }

onDirectorySelected(event: any): void {
  const files: FileList = event.target.files;
  const filePaths: string[] = [];
  const basePath = '/home/zentox/Documents/BR02/WE4B/WE4B_Project/angular-app/src/assets/'; // à remplacer par la méthode d'obtention de votre choix
  for (let i = 0; i < files.length; i++) {
    filePaths.push(basePath + files[i].webkitRelativePath);
  }
  this.scanDirectory(filePaths);
}

  scanDirectory(filePaths: string[]): void {
    this.musicService.scanDirectory(filePaths).subscribe(data => {
      // Mettre à jour la vue après avoir scanné le dossier
      this.getArtists();
      this.getAlbums();
      this.getMusics();
    });
  }
}
