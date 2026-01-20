/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
interface CardArticleItemsProps {
  url: string;
  title: string;
  description: string;
  srcImage: string;
}
const CardArticleItems = ({
  url,
  // description,
  title,
  srcImage,
}: CardArticleItemsProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  return (
    <div className='rounded-[10px] border-[1px] border-[#D3D3D3] p-[20px] text-[#1F1F1F]'>
      <p className='m-0 p-0 text-center text-[16px] font-medium leading-[19px] text-[#1F1F1F]'>
        {title}
      </p>
      <div
        className='lineClamp3 my-[14px] text-center text-[14px] leading-[20px] text-[#6F6D6D] xs:px-[0px]	'
        // dangerouslySetInnerHTML={{ __html: description }}
      />

      <p
        className='cursor-pointer text-center text-[14px] leading-[17px] text-[#1464a9]'
        onClick={() => router.push(url)}
      >
        {t('More')}
      </p>
      <img
        src={srcImage}
        alt='url'
        className='mt-[20px] h-[330px] w-full rounded-xl object-fill'
      />
    </div>
  );
};

export default CardArticleItems;
