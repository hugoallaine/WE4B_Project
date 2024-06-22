export interface Track {
  id : string;
  title: string;
  duration: number;
  filePath: string;
  artist?: Artist;
  albumId?: string;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  tracks: Track[];
  artist?: Artist;
}

export interface Artist {
  id: string;
  name: string;
  pictureUrl: string;
  bio?: string;
  albums: Album[];
}
