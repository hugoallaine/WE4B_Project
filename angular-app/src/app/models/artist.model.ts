export interface Track {
  id : string;
  title: string;
  duration: number;
  filePath: string;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
  pictureUrl: string;
  albums: Album[];
}
