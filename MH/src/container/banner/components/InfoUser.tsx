/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Modal, notification, Popover } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { LOGIN_HOME } from '@/contants/endpoint';
import { USER } from '@/contants/Storage';
import { changePassword } from '@/services/booking.services';

import ChangePasswordForm from './ChangePasswordForm';

const InfoUser = ({ handleLogout }: { handleLogout: () => void }) => {
  const user = localStorage.getItem(USER);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { t } = useTranslation('common');
  const { t: tBooking } = useTranslation('booking');
  const exit = t(`Exit`);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(changePassword, {
    onSuccess: () => {
      queryClient.invalidateQueries(['Change-password']);
      notification.success({
        message: t('changePasswordSuccess'),
        placement: 'top',
      });
      setIsOpen(false);
      router.push(LOGIN_HOME);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : t('changePasswordError')
        }`,
        placement: 'top',
      });
    },
  });
  const content = () => {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className='cursor-pointer text-[#1464a9]'
      >
        {t('ChangePassword')}
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className='text-center text-[24px] font-bold '>
        {t('ChangePassword')}
      </div>
    );
  };
  const onClose = () => {
    setIsOpen(false);
  };
  const handleChangePassword = async () => {
    const res = await form.validateFields();
    mutate({ ...res });
  };
  return (
    <div className='flex flex-row items-center justify-center gap-x-[10px]'>
      <Popover content={content} trigger='click'>
        <div style={{ cursor: 'pointer' }}>
          <Image
            src='/images/user-icon.svg'
            width={28}
            height={28}
            alt='user'
          />
        </div>
      </Popover>
      <p className='m-0 p-0 text-[14px] leading-[17px] text-[#1F1F1F]'>
        {user && JSON.parse(user)?.username}
      </p>
      <p
        className='leading-[17px m-0 cursor-pointer p-0 text-[14px] text-[#1F1F1F]'
        onClick={handleLogout}
      >{`[${exit}]`}</p>

      <Modal
        footer={null}
        visible={isOpen}
        title={renderHeader()}
        destroyOnClose
        closeIcon={<CloseOutlined className='text-[24px]' />}
        onCancel={onClose}
        className='top-[calc(5vh)] w-[calc(50vw)] sm:top-0 sm:w-screen'
      >
        <div className='p-4'>
          <ChangePasswordForm form={form} />
          <div className='flex flex-row items-center justify-center gap-2'>
            <Button
              className='w-[100px] border-[#1464a9] text-[#1464a9] hover:bg-[#1464a9] hover:text-white'
              onClick={handleChangePassword}
            >
              {tBooking('Save')}
            </Button>
            <Button
              onClick={onClose}
              className='w-[100px] border-red-500 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white'
            >
              {tBooking('Cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InfoUser;
