import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Modal, Select } from 'antd';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';

import { EStatusDeliveryAcftership } from '@/contants/columns/check-point-columns';
import { countries } from '@/contants/types/Country';
import * as momentTimezone from 'moment-timezone';
interface CreateCheckPointModal {
  onClose: (b: boolean) => void;
  form: FormInstance;
  onSubmit: () => void;
  isEdit: boolean;
}

const { Option } = Select;
const CreateCheckPoint = ({
  onClose,
  form,
  onSubmit,
  isEdit,
}: CreateCheckPointModal) => {
  const renderHeader = () => {
    return (
      <div
        className=' text-center text-[24px]
      font-bold'
      >
        {isEdit ? 'Chỉnh sửa checkpoint ' : 'Thêm mới checkpoint'}
      </div>
    );
  };

  const timezones = momentTimezone.tz.names();
  const handleCloseModal = () => {
    onClose(false);
  };

  const statusOpitionAftership = Object.entries(EStatusDeliveryAcftership).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  return (
    <Modal
      footer={null}
      visible={true}
      title={renderHeader()}
      closeIcon={<CloseOutlined className='text-[24px]' />}
      onCancel={handleCloseModal}
      className='top-[calc(5vh)] w-[calc(60vw)]'
    >
      <Form form={form} className='gap-4'>
        <div className='grid grid-cols-3 gap-4'>
          <Form.Item
            name='city'
            rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
          >
            <VInput
              placeholder='Nhập thành phố'
              label='Thành Phố'
              isHorizal
              required
            />
          </Form.Item>

          <Form.Item
            name='countryIso3'
            rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}
          >
            <VSelect label='Quốc gia' required isHorizal showSearch>
              {countries.map((v) => (
                <Option key={v.value}>{v.label}</Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='tag'
            rules={[{ required: true, message: 'Vui lòng nhập tag' }]}
          >
            <VSelect label='Tag' required isHorizal showSearch>
              {statusOpitionAftership.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
        </div>
        <Form.Item
          name='location'
          rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
        >
          <VInput placeholder='Vị trí' label='Vị trí' isHorizal required />
        </Form.Item>
        <div className='grid grid-cols-3 gap-4'>
          <Form.Item
            name='checkpointTime'
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian checkpoint' },
            ]}
          >
            <VDatePicker
              isHorizal
              required
              placeholder='Nhập checkpoint time'
              label='Thời gian Checkpoint '
              format='DD/MM/YYYY HH:mm'
              showTime
            />
          </Form.Item>
          <Form.Item
            name='timezone'
            initialValue={'Asia/Ho_Chi_Minh'}
            rules={[{ required: true, message: 'Vui lòng chọn múi giờ' }]}
          >
            <VSelect
              label='Múi giờ'
              required
              isHorizal
              showSearch
              defaultValue={'Asia/Ho_Chi_Minh'}
            >
              {timezones.map((timezone) => (
                <Option key={timezone} value={timezone}>
                  {timezone}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4'>
          <Form.Item
            name='message'
            rules={[{ required: true, message: 'Vui lòng nhập lời nhắn' }]}
          >
            <VTextArea
              rows={8}
              placeholder='Lời nhắn'
              label='Lời nhắn'
              isHorizal
            />
          </Form.Item>
        </div>
      </Form>
      <div>
        <Button className='mt-5' type='primary' onClick={() => onSubmit()}>
          {isEdit ? 'Cập nhật checkpoint' : ' Thêm mới checkpoint'}
        </Button>
      </div>
    </Modal>
  );
};

export default CreateCheckPoint;
