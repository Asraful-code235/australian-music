import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Clipboard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export type User = {
  id: string;
  djName: string;
  email: string;
  password: string;
  type: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'djName',
    header: 'DJ Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'password',
    header: 'Password',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      const copyCredentials = () => {
        const credentials = `DJ Name: ${user.djName}\nEmail: ${user.email}\nPassword: ${user.password}`;
        navigator.clipboard.writeText(credentials);
        toast.success('Credentials copied to clipboard');
      };

      const deleteUser = async () => {
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete user');
          }

          toast.success(`User ${user.djName} deleted`);
        } catch (error) {
          console.error(error);
          toast.error('An error occurred while deleting the user');
        }
      };

      return (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={copyCredentials}
            className='h-8 w-8'
          >
            <Clipboard className='h-4 w-4' />
          </Button>
          <Button
            variant='destructive'
            size='icon'
            onClick={deleteUser}
            className='h-8 w-8'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      );
    },
  },
];
