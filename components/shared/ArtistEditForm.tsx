import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArtistInput } from '../pages/artists/ArtistsPage';

type ArtistEditFormProps = {
  onSubmit: any;
  errors: any;
  register: any;
};

export default function ArtistEditForm({
  errors,
  register,
}: ArtistEditFormProps) {
  return (
    <div className='space-y-4 py-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Artist Name</Label>
        <Input
          id='name'
          type='text'
          placeholder='Artist name'
          autoFocus={false}
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className='text-red-500 text-sm'>{errors.name.message}</p>
        )}
      </div>
    </div>
  );
}
