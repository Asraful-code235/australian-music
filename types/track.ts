export interface Track {
  status: string | null;
  id: string;
  title: string;
  artist?: string | null;
  djId: string;
  releaseDate: Date | null | undefined;
  isCustom?: boolean | null;
  position?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
