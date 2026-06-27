import { AutoComplete, AutoCompleteProps } from 'antd';
import React from 'react';

type VAutoCompleteProps = AutoCompleteProps & {
  label: string;
  required?: boolean;
  isHorizal?: boolean;
};

export default function VAutoComplete({
  label,
  required,
  isHorizal,
  ...rest
}: VAutoCompleteProps) {
  return isHorizal ? (
    <div className='space-y-1'>
      <span className='text-sm font-medium'>
        {label} {required && <span className='text-red-700'>*</span>}:
      </span>
      <AutoComplete
        {...rest}
        filterOption={(input, option) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //  @ts-ignore
          option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
        }
      />
    </div>
  ) : (
    <div className='grid grid-cols-[200px_minmax(200px,_1fr)_auto] gap-1 sm:grid-cols-[150px_minmax(200px,_1fr)_auto]'>
      <span className='text-sm font-medium'>
        {label} {required && <span className='text-red-700'>*</span>} :
      </span>
      <AutoComplete
        {...rest}
        filterOption={(input, option) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //  @ts-ignore
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      />
    </div>
  );
}
