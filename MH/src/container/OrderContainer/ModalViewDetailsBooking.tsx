import { CloseOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import React from 'react';
import { useQuery } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';

import { QUERY_BOOKING } from '@/contants/query-key/booking.query';
import { getBookingById } from '@/services/booking.services';

import ViewBookingDetails from './components/ViewBookingDetails';

type ModalViewBookingProps = {
  id?: string;
  onClose: (value: boolean) => void;
};

const ModalViewDetailsBooking = ({ id, onClose }: ModalViewBookingProps) => {
  const { data, isLoading, isFetching } = useQuery(
    [QUERY_BOOKING.GET_BOOKING, { id }],
    () => getBookingById(id)
  );

  return (
    <Modal
      footer={null}
      visible={true}
      title={
        <HeaderModal
          title={`Chi tiết đơn hàng Số bill: ${data?.booking?.bookingCode} , Tên Công ty: ${data?.booking?.senderNameVi}`}
          onClose={() => onClose(false)}
        />
      }
      closeIcon={<CloseOutlined className='text-[24px]' />}
      destroyOnClose
      closable={false}
      onCancel={() => onClose(false)}
      className='top-[20px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <Spin spinning={isLoading || isFetching}>
        <ViewBookingDetails data={data} />
      </Spin>
    </Modal>
  );
};

export default ModalViewDetailsBooking;
