/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import InputCustome from '../input/InputCustome';

const TrackingForm = () => {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation('common');
  const router = useRouter();
  const handleFocus = () => {
    router.push(`/tracking/${searchText.toString()}`);
  };

  const handleChange = (e: any) => {
    setSearchText(e.target.value);
  };
  return (
    <div className=' z-10 flex w-[626px] flex-col gap-x-[26px] rounded-[20px] bg-[#F8F8F8]  p-[26px] xs:w-[325px]'>
      <p className='m-0 p-0 text-center text-[16px] font-medium uppercase leading-[19px] text-[#1F1F1F]'>
        {t('Track')}
      </p>

      <InputCustome
        styleButton='mt-0'
        placeholder={t('Tracking')}
        onChange={handleChange}
        height={168}
        suffix={
          <Image
            onClick={handleFocus}
            src='/images/search-icon.svg'
            className='cursor-pointer'
            width={38}
            height={38}
            alt='search'
          />
        }
      />

      {/* <div className='flex cursor-pointer flex-row items-center gap-x-2'>
        <Image src='/images/info.svg' width={20} height={20} alt='X' />
        <p className='m-0 p-0 text-[12px] leading-[15px] text-[#464DF4]'>
          {t('ContractInfo')}
        </p>
      </div> */}
    </div>
  );
};

export default TrackingForm;
