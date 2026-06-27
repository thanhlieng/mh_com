import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import Breadcumb from '@/components/Breadcrumb';
import FormCustomerRequest from '@/components/FormCustomerRequest';
import ListNew from '@/components/ListNew';

import {
  DATA_COMPANY_NEW_EN,
  DATA_COMPANY_NEW_LI,
} from '@/contants/mock-data/mock-data';

// import BANNER from '~/images/hinh-anh-xam.jpeg';

const CompanyNewForm = () => {
  const { lang } = useTranslation('common');
  const dataMock = lang === 'vi' ? DATA_COMPANY_NEW_LI : DATA_COMPANY_NEW_EN;
  return (
    <div className='lg:w-full m-auto w-[1174px]'>
      <div>
        <div className='lg:mb-[10px] lg:w-full float-left mb-[30px] w-[905px]'>
          <div className='relative w-full'>
            <Image src='' height={262} width={905} alt='[image]' />
          </div>
          <Breadcumb />
        </div>
        <div className='lg:float-left lg:mb-[5px] lg:w-full float-right'>
          <FormCustomerRequest />
        </div>
      </div>
      <div className='float-left'></div>
      <div className='lg:w-full lg:px-[10px] float-left w-[905px]'>
        <div className='mt-[20px]'>
          {dataMock.map((value) => {
            return (
              <ListNew
                title={value.title}
                slug={value.slug}
                key={value.id}
                img={value.img}
                desc={value.desc}
                time={value.time}
              />
            );
          })}
        </div>
        {/* <div className='float-left mb-[15px] flex w-full items-center justify-between'>
          <button className='m-[0_auto] h-[38px] w-[140px]  bg-[#ec3236] text-[16px] font-semibold leading-[39px] text-[#fff]'>
            LOAD MORE
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default CompanyNewForm;
