import useTranslation from 'next-translate/useTranslation';

const ShowPostCodeVN = () => {
  const { t } = useTranslation('booking');
  return (
    <a
      target='_blank'
      rel='noopener noreferrer'
      href='https://docs.google.com/spreadsheets/d/1Q4JUKO4kiNezxFragv4_V-ExB09Pew1zWSXT0Qul6aI/edit?usp=sharing'
    >
      {t('Vietnam postal code lookup')}
    </a>
  );
};

export default ShowPostCodeVN;
