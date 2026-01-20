/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import React from 'react';

const BusinessFieldForm = () => {
  const router = useRouter();
  return (
    <div className='m-auto flex w-full flex-col'>
      <img src='/images/dich-vu-san-pham-1.svg' alt='x' />
      <div className=' relative h-[1132px] w-full'>
        <div className='absolute right-0'>
          <img src='/images/dich-vu-san-pham-2.svg' alt='x' />
        </div>
        <div className='absolute top-[283px] left-[130px] h-[312px] w-[497px] rounded-[80px] bg-[#FBE51D] py-[46px] px-[32px]'>
          <div className='h-[220px]'>
            <p className='text-center text-[32px] font-bold'>
              Chuyển phát nhanh
            </p>
            <p className='text-center text-[16px]'>
              Chuyển phát nhanh là hình thức chuyển phát thông thường tuy nhiên
              có sự đảm bảo về thời gian vận chuyển đến tay người nhận...
            </p>
          </div>
          <p
            className='mr-6 cursor-pointer text-right font-semibold underline'
            onClick={() => router.push('/express-delivery')}
          >
            {`Xem Thêm >>`}
          </p>
        </div>
      </div>
      <div className='relative h-[1035.92px] w-full bg-[url(/images/dich-vu-san-pham-3.svg)]'>
        {/* <img src='/images/dich-vu-san-pham-3.svg' alt='x' /> */}
        <div className='absolute right-[171px] bottom-[167px] w-[434px] text-center'>
          <p className='text-[32px]'>Dịch vụ Air Cargo</p>
          <p>
            Dịch vụ Air Cargo là hàng hóa vận chuyển bằng máy bay hay còn được
            giọi là đường hàng không đây là phương thức hàng hóa có thể được
            chuyển bằng máy bay chuyên dụng.Có thể được chở trong khoang bụng
            trong máy bay hàng khách ...
          </p>
          <p
            className='mr-6 cursor-pointer text-right font-semibold underline'
            onClick={() => router.push('/air-cargo')}
          >
            {`Xem Thêm >>`}
          </p>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 p-4'>
        <img
          src='/images/forward.svg'
          alt='x'
          onClick={() => router.push('/forwarding')}
          className='cursor-pointer'
        />
        <img src='/images/forwrad2.svg' alt='x' />
      </div>
      <img src='/images/images22.svg' alt='x' className='mt-[47px]' />
    </div>
  );
};

export default BusinessFieldForm;
