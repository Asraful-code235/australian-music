export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string; // MongoDB ObjectId
  name?: string | null;
  email?: string | null;
  hashedPassword?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role?: UserRole | null;
  users?: UserTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export type Tracks = {
  id: string; // MongoDB ObjectId
  title: string;

  createdAt: Date;
  updatedAt: Date;
  user?: UserTrack[];
};

export interface UserTrack {
  id: string;
  userId: string;
  trackId: string;
  isExport?: boolean | null;
  status?: string | null;
  position?: number | null;
  user?: User;
  track?: Tracks;
  createdAt: Date;
  updatedAt: Date;
  mixes?: MixTrack[];
  artist?: string | null;
}

export interface Mix {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tracks?: MixTrack[];
}

export interface MixTrack {
  id: string;
  mixId: string;
  trackId: string;
  mix?: Mix;
  track?: Tracks;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrackInput {
  title: string;
  artist?: string;
  userId: string;
}

export interface CreateUserTrackInput {
  userId: string;
  trackId: string;
  isExport?: boolean;
  status?: string;
  position?: number;
}

export interface CreateMixTrackInput {
  mixId: string;
  trackId: string;
}
