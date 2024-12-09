import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { QueryObserverResult } from '@tanstack/react-query';
import { updateUserStatus } from '@/actions/user/updateUserStatus';
import { toast } from 'sonner';
import { RegisterFormInput } from '@/actions/auth';
import { UpdateUser } from '@/actions/user/UpdateUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { z } from 'zod';
import ModalForm from './shared-modal';
import { EditUserDialog } from '../pages/users/edit-user-form';
import ConfirmModal from './ConfirmModal';

type UserCardProps = {
  items: {
    id: string;
    name?: string | null;
    email?: string | null;
    hashedPassword?: string | null;
    plainPassword?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    role: 'ADMIN' | 'USER';
  };
  index: number;
  handleCopy: (email: string, password: string) => void;
  refetch?: () => Promise<QueryObserverResult>;
};

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN']),
});

export default function UsersCard({
  items,
  index,
  handleCopy,
  refetch,
}: UserCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState('');
  const {
    register,
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: items.name || '',
      email: items.email || '',
      password: items.plainPassword || '',
      role: items.role || 'USER',
    },
  });

  const onSubmit = (data: RegisterFormInput) => {
    try {
      startTransition(async () => {
        const result = await UpdateUser({ data, id: items.id });
        if (result.id) {
          toast.success('User Updated Successful');
          reset();
          if (refetch) refetch();
        }
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';

      toast.error(message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryIdToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryIdToDelete !== null) {
      handleDelete(categoryIdToDelete);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await updateUserStatus(id);

      //   await deleteCategory(id);
      //   refetch();
      if (res.id) {
        toast.success('User Deleted Successfully');
        if (refetch) refetch();
      }
    } catch (error) {
      toast.error('Failed to delete category. Please try again.');
    }
  };
  return (
    <>
      <Card className='hover:shadow-lg transition-shadow'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium'>#{index + 1}</span>
            <Badge
              variant={items.role === 'ADMIN' ? 'destructive' : 'secondary'}
            >
              {items.role}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => setIsOpen(true)}
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive'
              onClick={() => handleDeleteClick(items.id)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={() =>
                handleCopy(items.email || 'N/A', items.plainPassword || '')
              }
            >
              <Copy className='h-3 w-3' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid gap-2'>
            <div className='text-sm font-medium'>DJ Name</div>
            <div className='text-sm text-muted-foreground'>{items.name}</div>
          </div>
          <div className='grid gap-2'>
            <div className='text-sm font-medium'>Email</div>
            <div className='text-sm text-muted-foreground'>{items.email}</div>
          </div>
          <div className='grid gap-2'>
            <div className='text-sm font-medium'>Password</div>
            <div className='flex items-center gap-2'>
              <div className='text-sm text-muted-foreground'>*********</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ModalForm<RegisterFormInput>
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title='Add category'
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isValid={isValid}
        isPending={isPending}
      >
        <EditUserDialog
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          errors={errors}
          control={control}
          register={register}
          isValid={isValid}
        />
      </ModalForm>
      <ConfirmModal
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title='This action cannot be undone. This will permanently delete your category and remove your data from our servers.'
        onClick={handleConfirmDelete}
      />
    </>
  );
}
