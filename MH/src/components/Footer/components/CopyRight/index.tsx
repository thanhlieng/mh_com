import useTranslation from 'next-translate/useTranslation';

const CopyRight = () => {
  const { t } = useTranslation('common');
  return (
    <div className='flex h-[37px] w-full items-center justify-center bg-[#1F1F1F] text-center text-[#fff]'>
      <p className='m-0 p-0 text-[12px] leading-[15px]'>{t('CopyRight')}</p>
    </div>
  );
};

export default CopyRight;
