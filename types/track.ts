export interface Track {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  isCustom?: boolean;
  position: number;
}