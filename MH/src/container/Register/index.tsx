/* eslint-disable @typescript-eslint/no-explicit-any */
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { useState } from 'react';

import ToogleButton from '@/components/ToggleButton';

import Coprorate from './components/Coprorate';
import Personal from './components/Personal';

const RegisterForm = () => {
  const { t } = useTranslation('common');
  const [checked, setChecked] = useState(true);

  return (
    <div className='mx-auto'>
      <p className='mt-[40px] text-center text-[18px] font-medium uppercase leading-[22px] text-[#1F1F1F]'>
        {t('Register')}
      </p>
      <div className='mt-[40px] mb-[20px] w-full px-2 text-center'>
        <ToogleButton
          checked={checked}
          handleClick={() => setChecked(!checked)}
          unCheckTitle={t('Corporate')}
          checkedTitle={t('Personal')}
          // Khách hàng cá nhân
        />
      </div>
      {checked ? <Personal /> : <Coprorate />}
    </div>
  );
};

export default RegisterForm;
