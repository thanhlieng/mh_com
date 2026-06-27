/* eslint-disable @next/next/no-img-element */
import React from 'react';

const RecruimentForm = () => {
  const data = [
    {
      src: '/images/recument02.svg',
      title: 'Tuyển dụng nhân viên sale',
      details:
        'ACF thông báo tuyển dụng Nhân viên kinh doanh chuyển phát nhanh. Lương hấp dẫn, chế độ đãi ngộ nhất ...',
    },
    {
      src: '/images/recument02.svg',
      title: 'Tuyển dụng nhân viên sale',
      details:
        'ACF thông báo tuyển dụng Nhân viên kinh doanh chuyển phát nhanh. Lương hấp dẫn, chế độ đãi ngộ nhất ...',
    },
    {
      src: '/images/recument02.svg',
      title: 'Tuyển dụng nhân viên sale',
      details:
        'ACF thông báo tuyển dụng Nhân viên kinh doanh chuyển phát nhanh. Lương hấp dẫn, chế độ đãi ngộ nhất ...',
    },
    {
      src: '/images/recument02.svg',
      title: 'Tuyển dụng nhân viên sale',
      details:
        'ACF thông báo tuyển dụng Nhân viên kinh doanh chuyển phát nhanh. Lương hấp dẫn, chế độ đãi ngộ nhất ...',
    },
    {
      src: '/images/recument02.svg',
      title: 'Tuyển dụng nhân viên sale',
      details:
        'ACF thông báo tuyển dụng Nhân viên kinh doanh chuyển phát nhanh. Lương hấp dẫn, chế độ đãi ngộ nhất ...',
    },
    {
      src: '/images/recument02.svg',
      title: 'Tuyển dụng nhân viên sale',
      details:
        'ACF thông báo tuyển dụng Nhân viên kinh doanh chuyển phát nhanh. Lương hấp dẫn, chế độ đãi ngộ nhất ...',
    },
  ];
  return (
    <div className='m-auto w-full'>
      <img src='images/recument01.svg' alt='' />

      <div className='mx-auto mt-[97px] grid max-w-[1200px] grid-cols-3 gap-y-[47px] gap-x-[97px]'>
        {data.map((v, i) => (
          <div key={i} className='w-[355px] border-[1px]'>
            <img src={v.src} alt='' />
            <p className='mt-4 text-center font-bold'>{v.title}</p>
            <p className='px-[37px] text-center'>{v.details}</p>
            <p className='mr-4 text-right font-bold underline'>{`Xem Thêm >>`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruimentForm;
