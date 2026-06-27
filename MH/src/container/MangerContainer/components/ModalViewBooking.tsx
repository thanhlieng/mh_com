import { Modal, Spin } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { useQuery } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import CloseIcon from '@/components/Icon/CloseIcon';

import { getMyBookingById } from '@/services/booking.services';

import Viewbooking from './components/ViewBooking';

type ModalViewBookingProps = {
  onClose: (value: boolean) => void;
  id?: string | undefined;
};
const ModalViewBooking = ({ id, onClose }: ModalViewBookingProps) => {
  const { data, isLoading, isFetching } = useQuery(
    ['ModalViewBooking', { id }],
    () => getMyBookingById(id)
  );
  const { t } = useTranslation('booking');
  return (
    <Modal
      footer={null}
      visible={true}
      title={
        <HeaderModal
          title={t('Order Details')}
          onClose={() => onClose(false)}
        />
      }
      closeIcon={<CloseIcon />}
      destroyOnClose
      closable={false}
      onCancel={() => onClose(false)}
      className='top-[20px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <Spin spinning={isLoading || isFetching}>
        <Viewbooking data={data} />
      </Spin>
    </Modal>
  );
};

export default ModalViewBooking;
