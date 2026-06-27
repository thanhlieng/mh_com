/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Modal } from 'antd';
import VInput from '@/components/common/VInput';
import { ruleRequeid } from '@/utils/common-function';
import { MasterListOptions } from '@/contants/types';
import VDatePicker from '@/components/common/VDatePicker';

interface ModalCategoryMaster {
  form: FormInstance;
  onClose: () => void;
  handleSubmit: () => void;
  isOpen: boolean;
  isUpdate: boolean;
  type: MasterListOptions | undefined | string;
}

const ModalCategoryMaster = ({
  form,
  onClose,
  isUpdate,
  isOpen,
  type,
  handleSubmit,
}: ModalCategoryMaster) => {
  const renderHeader = () => {
    return (
      <div
        className='rounded-sm  px-4 text-center font-bold
      capitalize'
      >
        {`${isUpdate ? 'Cập nhật' : 'Tạo mới'} ${
          type && MasterListOptions[type as unknown as 'SERVICE_BOOKING']
        }`}
      </div>
    );
  };

  const renderForm = (type: any) => {
    switch (type) {
      case 'SERVICE_PARTNER_INCOUNTRY':
      case 'UNIT_INFOMATION':
      case 'CONNECTION_PARTNER':
        return (
          <>
            <Form.Item
              name='name'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên cho danh mục',
                },
              ]}
            >
              <VInput label='Tên Danh mục' isHorizal />
            </Form.Item>
          </>
        );
      case 'SERVICE_PARTNER':
        return (
          <>
            <Form.Item
              name='name'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên cho danh mục',
                },
              ]}
            >
              <VInput label='Tên Danh mục' isHorizal />
            </Form.Item>

            <Form.Item name='codeAftership' rules={[]}>
              <VInput label='Code Aftership' isHorizal />
            </Form.Item>
          </>
        );
      case 'SERVICE_BOOKING':
        return (
          <>
            <Form.Item
              name='name'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên cho danh mục',
                },
              ]}
            >
              <VInput label='Tên Danh mục' isHorizal />
            </Form.Item>

            <Form.Item
              name='coefficient'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập hệ số dịch vụ',
                },
              ]}
            >
              <VInput label='Hệ số dịch vụ' isHorizal />
            </Form.Item>
          </>
        );
      case 'JAPAN_ADDRESS':
        return (
          <>
            <Form.Item name='consigneeNameEnglish' rules={ruleRequeid()}>
              <VInput label='Tên người nhận (Tiếng Anh)' required />
            </Form.Item>
            <Form.Item name='consigneeNameJapanese' rules={ruleRequeid()}>
              <VInput label='Tên người nhận (Tiếng Nhật)' required />
            </Form.Item>
            <Form.Item name='consigneeCode' rules={ruleRequeid()}>
              <VInput label='Postal Code' required />
            </Form.Item>
            <Form.Item name='registeredCompanyName' rules={ruleRequeid()}>
              <VInput label='Tên công ty đã đăng ký	' required />
            </Form.Item>
            <Form.Item name='address' rules={ruleRequeid()}>
              <VInput label='Địa chỉ' required />
            </Form.Item>
          </>
        );
      case 'EXCHANGE_RATE':
        console.log('fuckkk yiou');
        return (
          <>
            <Form.Item
              name='timeApplyFrom'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn thời gian bắt đầu áp dụng tỷ giá',
                },
              ]}
            >
              <VDatePicker
                className='w-full'
                format='DD/MM/YYYY'
                label=' Thời gian áp dụng tỷ giá'
                required
              />
            </Form.Item>
            <Form.Item
              name='timeApplyTo'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn thời gian cuối áp dụng tỷ giá',
                },
              ]}
            >
              <VDatePicker
                className='w-full'
                format='DD/MM/YYYY'
                label=' Thời gian áp dụng tỷ giá'
                required
              />
            </Form.Item>
            <Form.Item name='rate'>
              <VInput label='Tỷ giá' required type='number' />
            </Form.Item>
          </>
        );

      case 'CUSTOMER_MANGER_COMPANY':
      case 'REQUEST_SERVICES':
      case 'FIXED_PRICE':
        return (
          <Form.Item
            name='name'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tên khách hàng',
              },
            ]}
          >
            <VInput label='Tên khách hàng' isHorizal />
          </Form.Item>
        );
      default:
        break;
    }
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
      <div className='flex flex-col gap-4'>
        <Form form={form}>{renderForm(type)}</Form>

        <div className='flex gap-4'>
          <Button type='primary' onClick={handleSubmit}>
            {`${isUpdate ? 'Cập nhật' : 'Tạo mới'}`}
          </Button>

          <Button type='primary' onClick={onClose}>
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCategoryMaster;
