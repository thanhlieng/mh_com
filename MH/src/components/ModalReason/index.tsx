import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Modal } from 'antd';

import { requiredRule } from '@/utils/common-function';

import VTextArea from '../common/VTextarea';

interface ModalReasonProps {
  isOpen: boolean;
  form: FormInstance;
  onClose: () => void;
  onSubmit: () => void;
}
const ModalReason = ({ isOpen, form, onClose, onSubmit }: ModalReasonProps) => {
  const renderHeader = () => {
    return (
      <div
        className=' text-center text-[24px]
      font-bold'
      >
        Lý do hủy đơn hàng
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
    >
      <Form form={form} className='p-4'>
        <Form.Item
          name='reason'
          rules={requiredRule('Vui lòng nhập lý do hủy đơn hàng')}
        >
          <VTextArea label='Lý do hủy đơn hàng' rows={4} isHorizal />
        </Form.Item>
      </Form>

      <div className='flex flex-row items-center justify-center gap-4'>
        <Button type='primary' danger onClick={onSubmit}>
          Đồng ý
        </Button>
        <Button onClick={onClose}>Hủy</Button>
      </div>
    </Modal>
  );
};
export default ModalReason;
