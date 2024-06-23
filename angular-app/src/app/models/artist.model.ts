/**
 * Track model
 */
export interface Track {
  id : string;
  title: string;
  duration: number;
  filePath: string;
  artist?: Artist;
  albumId?: string;
}

/**
 * Album model
 */
export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  tracks: Track[];
  artist?: Artist;
}

/**
 * Artist model
 */
export interface Artist {
  id: string;
  name: string;
  pictureUrl: string;
  bio?: string;
  albums: Album[];
}
