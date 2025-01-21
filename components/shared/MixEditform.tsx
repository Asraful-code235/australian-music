import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type MixEditFormProps = {
  errors: any;
  register: any;
};

export default function MixEditForm({ errors, register }: MixEditFormProps) {
  return (
    <div className='space-y-4 py-4'>
      <div className='space-y-2'>
        <Label htmlFor='title'>Mix Title</Label>
        <Input
          id='title'
          type='text'
          placeholder='Mix title'
          autoFocus={false}
          {...register('title')}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className='text-red-500 text-sm'>{errors.title.message}</p>
        )}
      </div>
    </div>
  );
}
