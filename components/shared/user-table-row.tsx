import { IoClipboardOutline } from 'react-icons/io5';
import { Button } from '../ui/button';
import { TableCell, TableRow } from '../ui/table';
import { PiNotePencilLight } from 'react-icons/pi';
import { FiTrash2 } from 'react-icons/fi';
import { EditUserDialog } from '../pages/users/edit-user-form';
import ModalForm from './shared-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormInput } from '@/actions/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { UserRole, UserTrack } from '@/types/track';
import { toast } from 'sonner';
import { UpdateUser } from '@/actions/user/UpdateUser';
import { QueryObserverResult } from '@tanstack/react-query';
import { updateUserStatus } from '@/actions/user/updateUserStatus';
import ConfirmModal from './ConfirmModal';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN']),
});

type UserTableRowProps = {
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

export default function UserTableRow({
  items,
  index,
  handleCopy,
  refetch,
}: UserTableRowProps) {
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
    console.log({ data });
    console.log('submitted');
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
      console.error('Registration error:', error);
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
      console.log({ res });
      //   await deleteCategory(id);
      //   refetch();
      if (res.id) {
        toast.success('User Deleted Successfully');
        if (refetch) refetch();
      }
    } catch (error) {
      console.log('Error deleting item:', error);
      toast.error('Failed to delete category. Please try again.');
    }
  };

  return (
    <>
      {' '}
      <TableRow key={items.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{items.name}</TableCell>
        <TableCell>{items.email}</TableCell>
        <TableCell>*********</TableCell>
        <TableCell>{items.role}</TableCell>

        <TableCell className='text-center'>
          <div className='space-x-1.5'>
            <Button
              className='w-8 h-8'
              variant='outline'
              size='icon'
              onClick={() =>
                handleCopy(items.email || 'N/A', items.plainPassword || '')
              }
            >
              <IoClipboardOutline />
            </Button>

            <Button variant='outline' size='sm' onClick={() => setIsOpen(true)}>
              <PiNotePencilLight />
              Edit
            </Button>
            <Button
              className='w-8 h-8'
              variant='destructive'
              size='icon'
              onClick={() => handleDeleteClick(items.id)}
            >
              <FiTrash2 />
            </Button>
          </div>
        </TableCell>
      </TableRow>
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
