/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect, useState } from 'react';

import CardItems from '@/components/card-items';
import { EHomePage } from '@/components/FormPolicy/type';
import ItemBanner from '@/components/ItemBanner';
import TrackingForm from '@/components/TrackingForm';

import { IDataHomepage } from '@/contants/types';
import { getOptionsHomepage } from '@/services/post.service';
import { mappingOptionsHomepage } from '@/utils/common-function';

function HomePage() {
  const { lang, t } = useTranslation('common');
  const { t: tBooking } = useTranslation('booking');
  const [services, setServices] = useState<IDataHomepage[]>([]);

  useEffect(() => {
    const getData = async () => {
      const result = await getOptionsHomepage(EHomePage.SERVICE);
      setServices(mappingOptionsHomepage(result, lang));
    };
    getData();
  }, [lang]);

  const dataFakeNew = {
    title: tBooking('tilte-greate'),
    chil: [tBooking('child1'), tBooking('child2'), tBooking('child3')],
    dataFake: [
      {
        title: '3000+',
        label: t('Employee'),
      },
      {
        title: '2',
        label: t('Country'),
      },
      {
        title: '252+',
        label: t('Customer'),
      },
      {
        title: '100%',
        label: t('ABC'),
      },
    ],
  };
  const dataMapping = [
    {
      // icon: '/images/icon-5.svg',
      title: t('FlexibleDeliveryTime'),
      details: t('FlexibleDeliveryTimeContent'),
    },
    {
      // icon: '/images/icon-6.svg',
      title: t('NewDeliveryServies'),
      details: t('NewDeliveryServiesContent'),
    },
    {
      // icon: '/images/icon-7.svg',
      title: t('CostSavings'),
      details: () => {
        return (
          <div className='text-left'>
            <p className='m-0 p-0'>{t('CostSavingsContent1')}</p>
            <p className='m-0 p-0'>{t('CostSavingsContent2')}</p>
            <p className='m-0 p-0'>{t('CostSavingsContent3')}</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className='relative '>
      <div className='m absolute left-0 right-0 m-auto px-[38px] text-center xs:px-[15px]'>
        <img
          src='/images/banner.png'
          alt='banner'
          className='z-0 mt-[20px] h-[450px] w-full rounded-[20px] object-fill xs:hidden sm:max-h-[365px]'
        />
      </div>

      <div className='relative mb-[86px] mt-5 h-full w-full cursor-pointer px-[38px] xs:px-[15px]'>
        <div className=' m-auto flex items-center justify-center xs:mt-[145px] sm:mt-[84px] md:mt-[108px]'>
          <TrackingForm />
        </div>
        <div className='grid grid-cols-4 items-stretch gap-[14px] gap-y-2 px-[115px] xs:mt-[50px] xs:grid-cols-2 xs:p-0 sm:mt-[50px] sm:px-[40px] md:mt-[50px]'>
          {services.map((v, index) => (
            <CardItems
              title={v.title}
              path={v.href}
              url={v.icon!}
              key={index}
            />
          ))}
        </div>
        <div className='mb-[30px] flex flex-row  items-center justify-center text-center'>
          <img src='/images/car.png' alt='xx' width={650} />
        </div>
        <div className='xs:mt-[50px] sm:mt-[150px] '>
          <div className='mt-[54px] grid grid-cols-3 gap-x-[72px] px-[115px] xs:grid-cols-1 xs:px-[37px] sm:gap-x-[60px] sm:px-[60px]'>
            {dataMapping.map(({ title, details }, index) => (
              <ItemBanner title={title} details={details} key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* <div className='px-[30px]'>
        <div className='my-[86px] h-[428px] w-full rounded-[20px] bg-[url(/images/banner3.jpg)] bg-cover bg-center	bg-no-repeat xs:h-[402px]'>
          <div className='grid grid-cols-4 grid-rows-2 py-[60px] xs:grid-cols-2'>
            {dataFake.map((v, i) => (
              <CardInfo title={v.title} label={v.label} key={i} />
            ))}
            <CardInfo title={dataFake[0].title} label={dataFake[0].label} />
            <CardInfo title={dataFake[1].title} label={dataFake[1].label} />
            <div className='xs:col-span-2'>
              <CardInfo title={dataFake[2].title} label={dataFake[2].label} />
            </div>
          </div>
        </div>
      </div> */}
      <div className='flex w-full flex-row items-center justify-center '>
        <div className=' flex w-[1278px] flex-row gap-4 bg-[#f2f8f8] p-4 xs:flex-col'>
          <img src='/images/abc.png' alt='' className='w-[300px] xs:w-full' />
          <div>
            <p className='line-h text-[18px] font-bold'>{dataFakeNew.title}</p>
            <ul className='p-4'>
              {dataFakeNew.chil.map((v, i) => (
                <li key={i} className='list-disc'>
                  {v}
                </li>
              ))}
            </ul>

            <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
              {dataFakeNew.dataFake.map((v, i) => (
                <div
                  key={i}
                  className='flex flex-col items-center justify-center gap-2 border-[1px] border-dashed bg-white p-2'
                >
                  <p className='m-0 p-0 text-[18px] font-bold text-[#1464a9]'>
                    {v.title}
                  </p>
                  <p className='m-0 p-0 font-bold'>{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
