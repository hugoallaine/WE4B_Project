export interface Track {
  title: string;
  duration: number;
  filePath: string;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl?: string;
  tracks: Track[];
}
