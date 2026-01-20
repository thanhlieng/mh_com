/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { useQuery } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';

import { QUERY_BOOKING } from '@/contants/query-key/booking.query';
import { getBookingById } from '@/services/booking.services';

import UpdateBookingForManifest from './FormUpdate';

interface ManifestYamatoProps {
  idRow?: string;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  onSubmit: (data: any) => void;
}
const ManifestYamatoModal = ({
  idRow,
  setOpenModal,
  openModal,
}: ManifestYamatoProps) => {
  const { data } = useQuery([QUERY_BOOKING.GET_BOOKING, { id: idRow }], () =>
    getBookingById(idRow)
  );

  return (
    <Modal
      footer={null}
      open={openModal}
      title={
        <HeaderModal
        title={`Chi tiết đơn hàng: ${data?.booking?.partnerBillCode}, Tên khách hàng: ${data?.booking?.senderNameVi}`}
          onClose={() => setOpenModal(false)}
        />
      }
      destroyOnClose
      closeIcon={false}
      closable={false}
      onCancel={() => setOpenModal(false)}
      className='top-[20px] w-[calc(80vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <UpdateBookingForManifest
        idRow={idRow}
        data={data}
        onClosePopup={() => setOpenModal(false)}
      />
    </Modal>
  );
};

export default ManifestYamatoModal;
