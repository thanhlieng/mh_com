/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, notification } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';

import VInput from '@/components/common/VInput';

import { ACCSESS_TOKEN, REFRESH_TOKEN, USER } from '@/contants/Storage';
import { UsersRole } from '@/contants/types';
import { MANAGER_BOOKINGS, SUPPLIER_COST_STATEMENT } from '@/routes/routes';
import AuthenService from '@/services/Authen.service';
import storage from '@/utils/storage';

const LoginPage = () => {
  const { t } = useTranslation('common');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [form] = useForm();
  const router = useRouter();
  const { setItem } = storage();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const requestData = await form.validateFields();
    setLoading(true);
    try {
      const res = await AuthenService.login(requestData);
      if (!res || res.user.typeUser !== UsersRole.CLIENT) {
        setLoading(false);
        return notification.error({
          message: 'Đăng nhập không thành công, Vui lòng thử lại',
          placement: 'top',
        });
      }
      setItem(ACCSESS_TOKEN, res.tokens.access.token);
      setItem(REFRESH_TOKEN, res.tokens.refresh.token);
      setItem(USER, JSON.stringify(res.user));
      const destination = res.user.a_supplier_id
        ? SUPPLIER_COST_STATEMENT
        : MANAGER_BOOKINGS;
      router.push(destination);
      setLoading(false);
    } catch (error) {
      notification.error({
        message: 'Đăng nhập không thành công, Vui lòng thử lại',
        placement: 'top',
      });
      setLoading(false);
    }
  };

  return (
    <div className='p-10'>
      <p className='text-center text-[18px] font-medium uppercase leading-[22px] text-[#1F1F1F] '>
        {t('Login')}
      </p>
      <Form form={form} className='mx-auto max-w-[330px]'>
        <Form.Item name='register'>
          <Form.Item name='username'>
            <VInput
              label={t('UserName')}
              isHorizal
              className='rounded-[12px] px-[20px] py-[10px] '
            />
          </Form.Item>

          <Form.Item name='password'>
            <VInput
              type='password'
              label={t('Password')}
              isHorizal
              className='rounded-[12px] px-[20px] py-[10px]'
            />
          </Form.Item>
          <div className='flex flex-row justify-between'>
            <button
              onClick={handleLogin}
              className='cs rounded-[12px] bg-yellow-secondary px-[20px] py-[10px] text-[#fff]'
            >
              <p className='m-0 p-0 text-[14px] leading-[17px]'>{t('Login')}</p>
            </button>
            <button
              onClick={() => router.push('/register')}
              className='cs rounded-[12px] bg-yellow-secondary px-[20px] py-[10px] text-[#fff]'
            >
              <p className='m-0 p-0 text-[14px] leading-[17px]'>
                {t('Register')}
              </p>
            </button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
