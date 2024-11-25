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
};

export default function AllTracks({ tracks, refetch }: AllTracksProps) {
  return (
    <SortableContext items={tracks} strategy={verticalListSortingStrategy}>
      <div className='space-y-2'>
        {tracks && tracks.length > 0
          ? tracks.map((track) => (
              <TrackItem key={track.id} track={track} refetch={refetch} />
            ))
          : ''}
      </div>
    </SortableContext>
  );
}
