/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

interface CardItemsProps {
  url: string;
  path?: string;
  title: string;
}

const CardItems = ({ url, path, title }: CardItemsProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  return (
    <div className='z-10 m-auto flex h-full w-full flex-col items-center justify-center gap-y-6 rounded-[20px] bg-[#fff] py-[38px] shadow-card-item xs:gap-y-2 xs:py-[20px]'>
      <Image alt='example' src={url} width={58} height={58} />
      <p className='text-center text-[14px] font-medium uppercase leading-[17px] text-[#1F1F1F]'>
        {title}
      </p>
      <p className='text-[#1464a9]' onClick={() => router.push(path || '/')}>
        {t('More')}
      </p>
    </div>
  );
};
export default CardItems;
