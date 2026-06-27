/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { FormInstance, Modal } from 'antd';

import FormPolicy from '..';
import { ETypeLinkHomepage } from '../type';

interface ModalUpdatePoLicyProps {
  onClose: () => void;
  isOpen: boolean;
  form: FormInstance;
  handleSubmit: () => void;
  typeSelect: ETypeLinkHomepage | null | undefined;
  handleChangeSelect: (e: any) => void;
}

const ModalUpdatePoLicy = ({
  onClose,
  isOpen,
  form,
  handleSubmit,
  typeSelect,
  handleChangeSelect,
}: ModalUpdatePoLicyProps) => {
  const renderHeader = () => {
    return (
      <div
        className=' text-center text-[24px]
      font-bold'
      >
        Chỉnh sửa lựa chọn Homepage
      </div>
    );
  };

  return (
    <Modal
      footer={null}
      visible={isOpen}
      title={renderHeader()}
      destroyOnClose
      closeIcon={<CloseOutlined className='text-[24px]' />}
      onCancel={onClose}
      className='top-[calc(5vh)] w-[calc(70vw)] sm:top-0 sm:w-screen'
    >
      <FormPolicy
        form={form}
        handleSubmit={handleSubmit}
        typeSelect={typeSelect}
        handleChangeSelect={handleChangeSelect}
      />
    </Modal>
  );
};

export default ModalUpdatePoLicy;
