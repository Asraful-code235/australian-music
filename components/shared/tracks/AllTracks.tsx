import { TrackItem } from '@/components/tracks/TrackItem';
import { Track } from '@/types/track';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { QueryObserverResult } from '@tanstack/react-query';

type AllTracksProps = {
  tracks: Track[];
  refetch?: () => Promise<QueryObserverResult>;
  error: () => Array<boolean> | undefined;
};

export default function AllTracks({ tracks, refetch, error }: AllTracksProps) {
  return (
    <SortableContext items={tracks} strategy={verticalListSortingStrategy}>
      <div className='space-y-3'>
        {tracks && tracks.length > 0
          ? tracks.map((track, index) => (
              <TrackItem
                key={track.id}
                track={track}
                refetch={refetch}
                error={error}
                index={index}
              />
            ))
          : ''}
      </div>
    </SortableContext>
  );
}
