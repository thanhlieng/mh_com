import { Input, InputProps } from 'antd';
import clsx from 'clsx';
import React from 'react';

const InputCustome = ({
  handleButtonClick,
  titleButton,
  styleButton,
  ...props
}: {
  styleButton?: string;
  titleButton?: string;
  handleButtonClick?: () => void;
} & InputProps) => {
  return (
    <Input
      className={clsx(
        'mt-[18px] h-[50px] w-full rounded-[14px] outline-none',
        styleButton
      )}
      suffix={
        <button
          onClick={handleButtonClick}
          className='cs rounded-[12px] bg-yellow-secondary px-[20px] py-[10px] text-[#fff]'
        >
          <p className='m-0 p-0 text-[14px] leading-[17px]'> {titleButton}</p>
        </button>
      }
      {...props}
    />
  );
};

export default InputCustome;
