/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import setLanguage from 'next-translate/setLanguage';
// import useTranslation from 'next-translate/useTranslation';

const LangugeCompany = () => {
  // const { lang } = useTranslation('common');
  // const active = (language: string) => {
  //   return language === lang ? 'text-[#1464a9]' : 'text-[#1F1F1F]';
  // };

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className='flex gap-x-2'>
      <Image
        src='/images/vn-icon.svg'
        onClick={() => handleSetLanguage('vi')}
        alt=''
        className='cursor-pointer'
        width={24}
        height={24}
      />

      <p className='m-0 p-0 text-[#D3D3D3]'>|</p>
      <Image
        src='/images/eng-icon.svg'
        alt=''
        className='cursor-pointer'
        width={24}
        height={24}
        onClick={() => handleSetLanguage('en')}
      />
    </div>
  );
};

export default LangugeCompany;
