export enum ElementType {
    Album = 'album',
    Music = 'music',
    Artist = 'artist'
}

export interface Element {
    id: number;
    name: string;
    coverUrl: string;
    artist: string;
    type: ElementType;
}
  