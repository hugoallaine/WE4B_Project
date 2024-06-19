import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-element-cover',
  templateUrl: './element-cover.component.html',
  styleUrls: ['./element-cover.component.css']
})
export class ElementCoverComponent implements OnInit {
  @Input() filePath!: string;
  element: any = {
    name: '',
    artist: '',
    coverUrl: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMetadata(this.filePath);
  }

  loadMetadata(filePath: string) {
    this.http.get<any>(`http://localhost:8000/get_metadata.php?file=${filePath}`).subscribe(
      (data) => {
        this.element.name = data.title;
        this.element.artist = data.artist;
        this.element.coverUrl = data.coverUrl || 'assets/default-cover.jpg';
      },
      (error) => {
        console.error('Error fetching metadata:', error);
      }
    );
  }
}
