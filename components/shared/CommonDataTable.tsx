import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type DataTableProps = {
  headers: {
    key: string;
    value: string;
  }[];
  data: { data: Record<string, any>[]; page: number; totalPages: number };
  loading: boolean;
  params: {
    search: string;
    page: string;
  };
  setParams: (params: { search: string; page: string }) => void;
  onEdit?: (item: Record<string, any>) => void;
};

export default function CommonDataTable({
  headers,
  data,
  loading,
  params,
  setParams,
  onEdit,
}: DataTableProps) {
  const handlePreviousPage = () => {
    if (data.page > 1) {
      setParams({ ...params, page: String(data.page - 1) });
    }
  };

  const handleNextPage = () => {
    if (data.page < data.totalPages) {
      setParams({ ...params, page: String(data.page + 1) });
    }
  };

  return loading ? (
    'Loading...'
  ) : (
    <div className='mt-8 lg:w-2/6'>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead
                key={index}
                className={`capitalize ${
                  header.key === 'actions' ? 'w-[60px]' : ''
                }`}
              >
                {header.value}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, colIndex) => (
                <TableCell
                  key={`${rowIndex}-${colIndex}`}
                  className={header.key === 'actions' ? 'w-[60px]' : ''}
                >
                  {header.key === 'actions' ? (
                    <div className='flex gap-2'>
                      {onEdit && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onEdit(item)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  ) : (
                    item[header.key] ?? '-'
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.totalPages > 1 && (
        <div className='flex justify-between items-center mt-4'>
          <Button
            size='sm'
            onClick={handlePreviousPage}
            disabled={data.page <= 1}
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>
          <span className='text-sm text-muted-foreground'>
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            size='sm'
            onClick={handleNextPage}
            disabled={data.page >= data.totalPages}
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
