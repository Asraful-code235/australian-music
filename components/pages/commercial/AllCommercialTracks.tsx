import { TrackItem } from '@/components/pages/tracks/TrackItem';
import { UserTrack } from '@/types/track';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { QueryObserverResult } from '@tanstack/react-query';
import { CommercialTrackItem } from './CommercialTrackItem';

type AllCommercialTracksProps = {
  tracks?: UserTrack[];
  refetch?: () => Promise<void>;
  error: () => Array<boolean> | undefined;
};

export default function AllCommercialTracks({
  tracks,
  refetch,
  error,
}: AllCommercialTracksProps) {
  return (
    <SortableContext items={tracks!} strategy={verticalListSortingStrategy}>
      <div className='space-y-3'>
        {tracks && tracks.length > 0
          ? tracks.map((track, index) => (
              <CommercialTrackItem
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
