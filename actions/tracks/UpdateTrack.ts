'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';
import { Tracks } from '@/types/track';

export async function updateTrack(items: Tracks) {
  try {
    // const updatedTracks = await db.track.update({
    //   where: { id: items.id },
    //   data: {
    //     title: items.title,
    //     artist: items.artist,
    //     releaseDate: items.releaseDate,
    //   },
    // });
    // return updatedTracks;
  } catch (e) {
    console.log(e);
    return {
      error: getErrorMessage(e),
    };
  }
}

type UpdateTrackWithMixesParams = {
  trackId: string; // The ID of the track to update
  title?: string; // Optional: the new title of the track
  artist?: string; // Optional: the new artist of the track
  mixIds: string[]; // Array of mix IDs to associate with the track
};

export async function updateTrackWithMixes({
  trackId,
  title,
  artist,
  mixIds,
}: UpdateTrackWithMixesParams) {
  if (!trackId || !Array.isArray(mixIds) || mixIds.length === 0) {
    throw new Error("Invalid input: 'trackId' and 'mixIds' are required.");
  }
  return await db.$transaction(async (tx) => {
    const track = await tx.tracks.findUnique({
      where: { id: trackId },
    });
    if (!track) {
      throw new Error(`Track with ID ${trackId} not found.`);
    }

    const updatedTrack = await tx.tracks.update({
      where: { id: trackId },
      data: {
        title: title ?? track.title,
        artist: artist ?? track.artist,
      },
    });

    await tx.mixTrack.deleteMany({
      where: { trackId },
    });

    await tx.mixTrack.createMany({
      data: mixIds.map((mixId) => ({
        trackId,
        mixId,
      })),
    });

    return await tx.tracks.findUnique({
      where: { id: trackId },
      include: {
        mixes: {
          include: { mix: true },
        },
      },
    });
  });
}
