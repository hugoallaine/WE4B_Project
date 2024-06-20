import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MusicService } from '../services/music.service';
import { HorizontalScrollService } from '../services/horizontal-scroll.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  artists: any[] = [];

  constructor(
    private musicService: MusicService, 
    private horizontalScrollService: HorizontalScrollService,
    private renderer: Renderer2, private router: Router
  ) { }

  ngOnInit(): void {
    this.loadArtists();
  }

  ngAfterViewInit(): void {
    const sections = document.querySelectorAll('.element-container');
    sections.forEach(section => {
      this.horizontalScrollService.applySmoothScroll(section as HTMLElement, this.renderer);
    });
  }

  loadArtists(): void {
    this.musicService.getArtists().subscribe(artists => {
      this.artists = artists;
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
}
