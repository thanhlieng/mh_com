/* eslint-disable @next/next/no-img-element */
import React from 'react';

const AirCargoContainer = () => {
  return (
    <div>
      <div className='relative h-[770px] w-full bg-[url(/images/aircargo01.svg)]'>
        <div className='absolute bottom-0 left-1/3'>
          <div className='flex flex-row gap-4'>
            <p className='font-bold'>Dịch vụ Air Cargo </p>
            <div>
              <p className='m-0 p-0'>là vận chuyển hàng hóa bằng máy bay </p>
              <p>là một trong các dịch vụ tiêu biểu của chúng tô</p>
            </div>
          </div>
        </div>
      </div>
      <img src='/images/air-cargo.svg' alt='x' className='mt-[34px]' />
      <img src='/images/aircargo2.svg' alt='x' className='mx-auto mt-[12px]' />
      <img
        src='/images/air-cargo-3.svg'
        alt='x'
        className='mx-auto mt-[102px]'
      />
    </div>
  );
};

export default AirCargoContainer;
