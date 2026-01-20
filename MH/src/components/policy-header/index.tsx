import Image from 'next/image';
import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import TextLink from '../links/TextLink';

const PolicyHeader = () => {
  const { t } = useTranslation('common');
  const termsOfUse = t(`TermsOfUse`);
  const policy = t(`Policy`);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className='flex w-[1374px]  gap-4'>
      <TextLink href='/' label={policy} />
      <TextLink href='/' label={termsOfUse} />
      <Image
        src='/images/vi.svg'
        alt='[ico]'
        width={23}
        height={17}
        onClick={() => handleSetLanguage('vi')}
      />
      <Image
        src='/images/en.svg'
        alt='[ico]'
        width={23}
        height={17}
        onClick={() => handleSetLanguage('en')}
      />
    </div>
  );
};

export default PolicyHeader;
