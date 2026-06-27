import { Button, FormInstance, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import { EAddressBookingType } from '@/contants/types';

import FormAddressSender from './FormAddressSender';
import FormReceiverAddress from './FormReceiverAddress';
import HeaderModal from '../common/HeaderModal';

interface ModalFromSender {
  isOpen: boolean;
  onClose: () => void;
  form: FormInstance;
  isUpdate: boolean;
  type: EAddressBookingType;
  hanldeSubmit: () => void;
}
const ModalFromSender = ({
  hanldeSubmit,
  isOpen,
  onClose,
  isUpdate,
  form,
  type,
}: ModalFromSender) => {
  const { t } = useTranslation('booking');
  const renderForm = (type: EAddressBookingType) => {
    if (EAddressBookingType.SENDER_ADDRESS === type) {
      return <FormAddressSender form={form} />;
    }
    return <FormReceiverAddress form={form} />;
  };
  return (
    <Modal
      footer={null}
      open={isOpen}
      title={
        <HeaderModal
          title={!isUpdate ? t('Create New') : t('Update')}
          onClose={onClose}
        />
      }
      destroyOnClose
      closeIcon={false}
      closable={false}
      onCancel={onClose}
      className='top-[20px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      {renderForm(type)}
      <div className='w-'>
        <Button
          onClick={hanldeSubmit}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {isUpdate ? t('Update') : t('Create New')}
        </Button>
      </div>
    </Modal>
  );
};

export default ModalFromSender;
