'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { TfiTrash } from 'react-icons/tfi';

type Period = 'all' | 'one_week' | 'one_month' | 'six_month';

type DeleteTrackSelectProps = {
  onDelete: (value: Period) => void;
};

export default function DeleteTrackSelect({
  onDelete,
}: DeleteTrackSelectProps) {
  const [selectedValue, setSelectedValue] = useState<Period>('all');

  return (
    <div className='flex gap-2 w-full'>
      <Button onClick={() => onDelete(selectedValue)}>
        <TfiTrash />
        Delete
      </Button>
      <Select
        value={selectedValue}
        onValueChange={(value) => setSelectedValue(value as Period)}
      >
        <SelectTrigger className='w-full lg:w-[150px]'>
          <SelectValue placeholder='All' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>
          <SelectItem value='one_week'>One Week</SelectItem>
          <SelectItem value='one_month'>One Month</SelectItem>
          <SelectItem value='three_month'>Three Month</SelectItem>
          <SelectItem value='six_month'>Six Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
