export enum UserRole {
  ADMIN,
  USER,
}

export interface User {
  id: string; // MongoDB ObjectId
  name?: string | null;
  email?: string | null;
  hashedPassword?: string;
  plainPassword?: string;
  emailVerified?: Date | null;
  image?: string | null;
  role?: 'ADMIN' | 'USER';
  users?: UserTrack[];
  active?: boolean | null;
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

export type PaginatedTracks = {
  data: UserTrack[];
  count: number;
  limit: number;
  page: number;
  totalPages: number;
};

export interface UserTrack {
  id: string;
  userId: string;
  trackId?: string;
  isExport?: boolean | null;
  label?: string | null;
  status?: boolean | null;
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
  trackId?: string;
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

export type GigsData = {
  clubName: string;
  dayOfGig: Date;
  startDate: string;
  endDate: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  isExport: boolean;
  hasPlayed: 'yes' | 'no';
  userId: string;
};

export type GigsDataResponse = {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  data: GigsData[];
};

export type UserResponse = {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  data: User[];
};
