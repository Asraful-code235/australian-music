import { Music2, Trophy, User } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserTrack } from './tracks-table';
import { QueryObserverResult } from '@tanstack/react-query';
import { EditCommercialTrackModal } from './EditCommercialTrackModal';
import { EditUpfrontTrackModal } from './EditUpfrontTrackModal';

interface TrackCardItemsProps {
  index: number;
  data: {
    data: UserTrack[];
    count: number;
    limit: number;
    page: number;
    totalPages: number;
  };
  items: UserTrack;
  refetch?: () => Promise<QueryObserverResult>;
  trackType: 'commercial' | 'upfront';
}

export default function TrackCardItems({
  index,
  data,
  items,
  refetch,
  trackType,
}: TrackCardItemsProps) {
  return (
    <Card className='w-full hover:shadow-lg transition-shadow'>
      <CardHeader className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl font-bold'>
            <Badge variant='secondary' className='h-6'>
              #{index + 1 + (data.page - 1) * data.limit}
            </Badge>{' '}
            {items.track?.title}
          </CardTitle>

          <div className='self-start bg-gray-100 rounded-md'>
            {trackType === 'commercial' ? (
              <EditCommercialTrackModal track={items} refetch={refetch} />
            ) : (
              <EditUpfrontTrackModal track={items} refetch={refetch} />
            )}
          </div>
        </div>
        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
          <Trophy className='h-4 w-4' />
          <span>Chart Position: {items.position}</span>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <div className='grid gap-2'>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4 text-muted-foreground' />
            <div className='grid gap-0.5'>
              <label className='text-sm font-medium'>DJ Name</label>
              <span className='text-sm text-muted-foreground'>
                {items.user?.name}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Music2 className='h-4 w-4 text-muted-foreground' />
            <div className='grid gap-0.5'>
              <label className='text-sm font-medium'>Artist</label>
              <span className='text-sm text-muted-foreground'>
                {items?.artists?.name ? (
                  items?.artists?.name
                ) : (
                  <span className='text-red-500'>N/A</span>
                )}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Music2 className='h-4 w-4 text-muted-foreground rotate-90' />
            <div className='grid gap-0.5'>
              <label className='text-sm font-medium'>Mix</label>
              <span className='text-sm text-muted-foreground'>
                {items.mixes.length > 0 ? (
                  items.mixes
                    ?.map((item) => item?.mix?.title)
                    .filter(Boolean)
                    .join(', ')
                ) : (
                  <span className='text-red-500'>N/A</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
