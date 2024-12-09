'use client';

import { IoClipboardOutline } from 'react-icons/io5';
import { FiTrash2 } from 'react-icons/fi';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { GigsData, User, UserRole } from '@/types/track';
import dayjs from 'dayjs';

import { toast } from 'sonner';
import { PiNotePencilLight } from 'react-icons/pi';
import ConfirmModal from './ConfirmModal';
import { useState } from 'react';
import { updateUserStatus } from '@/actions/user/updateUserStatus';
import { EditUserDialog } from '../pages/users/edit-user-form';
import ModalForm from './shared-modal';
import UserTableRow from './user-table-row';
import { QueryObserverResult } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Copy, Edit, Trash2 } from 'lucide-react';
import UsersCard from './users-card';

type UserTableProps = {
  data: {
    data: {
      id: string;
      name?: string | null;
      email?: string | null;
      hashedPassword?: string | null;
      plainPassword?: string | null;
      emailVerified?: Date | null;
      image?: string | null;
      role: 'ADMIN' | 'USER';
    }[];
    count: number;
    limit: number;
    page: number;
    totalPages: number;
  };
  isLoading: boolean;
  params: {
    search: string;
    page: string;
  };
  setParams: (params: { search: string; page: string }) => void;
  refetch?: () => Promise<QueryObserverResult>;
};

export default function UsersTable({
  data,
  isLoading,
  params,
  setParams,
  refetch,
}: UserTableProps) {
  //   const [userData, setUserData] = useState<User | null>(null);

  const handleCopy = (email: string, password: string | null) => {
    const credentials = `Email: ${email}\nPassword: ${password || 'N/A'}`;
    navigator.clipboard
      .writeText(credentials)
      .then(() => {
        toast.success('Credentials copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy credentials.');
      });
  };
  return isLoading ? (
    'Loading...'
  ) : (
    <div className='mt-8'>
      <div className='lg:block hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Serial No.</TableHead>
              <TableHead>DJ Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className='text-center'>Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((items, index) => (
              <UserTableRow
                key={items.id}
                items={items}
                index={index}
                handleCopy={handleCopy}
                refetch={refetch}
                //   handleDeleteClick={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className='lg:hidden block'>
        <div className='grid md:grid-cols-2 grid-cols-1 gap-3'>
          {data.data.map((items, index) => (
            <UsersCard
              key={items.id}
              items={items}
              index={index}
              handleCopy={handleCopy}
              refetch={refetch}
            />
          ))}
        </div>
      </div>
      {data.totalPages > 1 && (
        <div className='flex items-center justify-end space-x-2 py-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setParams({
                ...params,
                page: (parseInt(params.page) - 1).toString(),
              })
            }
            disabled={+params.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setParams({
                ...params,
                page: (parseInt(params.page) + 1).toString(),
              })
            }
            disabled={+params.page >= data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
      {/* <ConfirmModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title='This action cannot be undone. This will permanently delete your category and remove your data from our servers.'
        onClick={handleConfirmDelete}
      /> */}
    </div>
  );
}
