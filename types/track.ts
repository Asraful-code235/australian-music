enum UserRole {
  ADMIN,
  USER,
}

export type TrackMixes = {
  id: string;
  mix: Mix;
  mixId: string;
  trackId: string;
};

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
  mixes?: TrackMixes[];
  dj?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: Date;
  role: UserRole;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  djId: string;
  image: string;
}

export interface Mix {
  id: string;
  title: string;
  status?: string | null;
  djId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  mixId?: string;
}
