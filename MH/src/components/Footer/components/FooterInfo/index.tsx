import useTranslation from 'next-translate/useTranslation';

const FooterInfo = () => {
  const { t } = useTranslation('common');

  return (
    <div className=''>
      {/* <Image width={80} height={30} src='/images/logo-acf.svg' alt='logo' /> */}
      <p className='text-[21px] font-bold'>MH GREAT SUN</p>
      <p className='mt-[18px] text-[14px] font-medium leading-[17px]'>
        {t('CompanyInfomation')}
      </p>
      <p className='text-[14px] font-light leading-[20px]'>
        {t('CompanyAddress')}
      </p>
      <p> {t('PhoneNumberContact')}</p>
      <p> {t('PhoneNumberContact2')}</p>
    </div>
  );
};
export default FooterInfo;
