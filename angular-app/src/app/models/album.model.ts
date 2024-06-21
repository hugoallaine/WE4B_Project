import { Track } from './track.model';

export interface Album {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl?: string;
  tracks: Track[];
}
