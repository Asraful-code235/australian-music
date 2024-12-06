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

export const columns: ColumnDef<User, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.getValue('email'),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.getValue('role') || 'N/A',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
];
