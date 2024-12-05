import React from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import Select from 'react-select/async-creatable';

type SearchAndSelectProps = {
  loadOptions: (
    inputValue: string,
    callback: (options: { value: string; label: string }[]) => void
  ) => void;
  onCreateOption: (inputValue: string) => void;
  value: { value: string; label: string }[];
  setSelectedMixes: (newValue: { value: string; label: string }[]) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
};

export default function SearchAndSelect({
  loadOptions,
  onCreateOption,
  value,
  setSelectedMixes,
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  ...props
}: SearchAndSelectProps) {
  return (
    <Select
      isMulti
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onCreateOption={onCreateOption}
      value={value}
      onChange={(
        newValue: MultiValue<{ label: string; value: string }>,
        actionMeta: ActionMeta<{ label: string; value: string }>
      ) => {
        setSelectedMixes([...newValue]); // Convert readonly array to mutable array
      }}
      onMenuScrollToBottom={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      placeholder='Search or create mixes'
      className='w-full'
      styles={{
        control: (provided, state) => ({
          ...provided,
          height: '2.25rem',
          borderRadius: '0.375rem',
          border: state.isFocused ? '1px solid #9CA3AF' : '1px solid #D1D5DB',
          backgroundColor: 'transparent',
          fontSize: '0.875rem',
          boxShadow: ' 0 1px 2px 0 rgb(0 0 0 / 0.05);',
          '&:hover': {
            borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB', // Prevent hover effect when focused
          },
        }),
        input: (provided) => ({
          ...provided,
          padding: '',

          fontSize: '16px',
        }),
        placeholder: (provided) => ({
          ...provided,
          color: '#9CA3AF',
        }),
        singleValue: (provided) => ({
          ...provided,
          color: '#1F2937',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? '#6B7280' : 'transparent',
          color: state.isSelected ? '#FFFFFF' : '#1F2937',
          '&:hover': {
            backgroundColor: '#6B7280',
            color: '#FFFFFF',
          },
        }),
      }}
      {...props}
    />
  );
}
