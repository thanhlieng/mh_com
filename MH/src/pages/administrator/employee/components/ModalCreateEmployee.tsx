import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Modal, notification, Select } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';

import FileUpload from '@/components/FileUpLoad';
import {
  BASE_URL,
  DEFAULT_DATE_FORMAT,
  LevelStaff,
} from '@/contants/common.constants';
import { QUERY_EMPLOYEE } from '@/contants/query-key/employee.contants';
import {
  EStatus,
  GENDER,
  IStaff,
  Marital,
  OpitionType,
} from '@/contants/types';
import { getUnit } from '@/services/customer.services';
import { createStaffs } from '@/services/employee.services';
import axios from 'axios';

interface IProps {
  onClose: (value: boolean) => void;
}
const ModalCreateEmployee = ({ onClose }: IProps) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { Option } = Select;

  const [fileList, setFileList] = useState<any | null>(null);

  const handleSetFileList = async (data: any) => {
    if (data.length > 0) {
      const files = data ? [...data] : [];
      const dataUpload = new FormData();
      files.forEach((file, i) => {
        dataUpload.append(`files`, file, file.name);
      });
      const upload = await axios({
        method: 'POST',
        url: `${BASE_URL}/upload-file`,
        data: dataUpload,
      });
      if (upload.data.data.length) {
        form.setFieldsValue({
          files: upload.data.data,
        });
        setFileList([upload.data.data]);
      }
    }
  };

  // OpitionUnits
  const { mutate: mutateCreate, isLoading: isCreating } = useMutation(
    createStaffs,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_EMPLOYEE.GET_EMPLOYEE);
        notification.success({
          message: 'Tạo mới tài khoản thành công',
          placement: 'top',
        });
        onClose(false);
      },
      onError: () => {
        notification.error({
          message: 'Something went wrong',
          placement: 'top',
        });
      },
    }
  );
  const { data: dataUnits } = useQuery(['getUnit', {}], () => getUnit());

  const onSubmit = async () => {
    const requestData: IStaff = await form.validateFields();
    mutateCreate({
      ...requestData,
      dayOfBirth: dayjs(requestData.dayOfBirth).format(DEFAULT_DATE_FORMAT),
      issueDate: dayjs(requestData.issueDate).format(DEFAULT_DATE_FORMAT),
      issueInsuranceDate: dayjs(requestData.issueInsuranceDate).format(
        DEFAULT_DATE_FORMAT
      ),
      insuranceParticipationDate: dayjs(
        requestData.insuranceParticipationDate
      ).format(DEFAULT_DATE_FORMAT),
      latestPromotionDate: dayjs(requestData.latestPromotionDate).format(
        DEFAULT_DATE_FORMAT
      ),
    });
  };
  const OpitionUnits = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataUnits?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataUnits?.map((v) => ({
        value: v.id,
        label: `${v.name}`,
      }));
    }
  }, [dataUnits]);
  const OpitionGender = Object.entries(GENDER).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const OpitionMatarial = Object.entries(Marital).map(([key, value]) => ({
    value: key,
    label: value,
  }));
  const OpitionLevel = Object.entries(LevelStaff).map(([key, value]) => ({
    value: key,
    label: value,
  }));
  const OptionStatus = Object.entries(EStatus).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  return (
    <Modal
      footer={null}
      title={
        <HeaderModal title='Tạo mới nhân viên' onClose={() => onClose(false)} />
      }
      visible={true}
      closable={false}
      onCancel={() => onClose(false)}
      closeIcon={<CloseOutlined className='text-[24px]' />}
      className='top-[calc(5vh)] w-[calc(40vw)]'
    >
      <div>
        <Form form={form}>
          <div className='h-[calc(70vh)] overflow-y-auto p-4'>
            <div className='grid grid-cols-2 gap-x-6'>
              <Form.Item
                name='status'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn trạng thái nhân viên',
                  },
                ]}
              >
                <VSelect
                  label='Trạng thái'
                  placeholder='Chọn trạng thái'
                  required
                  isHorizal
                >
                  {OptionStatus.map((v, k) => (
                    <Option key={k} value={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>
              <Form.Item
                name='fullName'
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <VInput
                  label='Tên nhân viên'
                  required
                  isHorizal
                  placeholder='Nhập vị tên nhân viên'
                />
              </Form.Item>

              <Form.Item
                name='placeOfBirth'
                rules={[{ required: true, message: 'Vui lòng nhập nơi sinh' }]}
              >
                <VInput
                  label='Nơi Sinh'
                  placeholder='Nhập nơi sinh'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='position'>
                <VInput
                  label='Vị trí làm việc'
                  placeholder='Nhập vị trí làm việc'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='gender'
                rules={[{ required: true, message: 'Vui lòng chọn' }]}
              >
                <VSelect
                  label='Giới tính'
                  placeholder='Chọn giới tính'
                  required
                  isHorizal
                >
                  {OpitionGender.map((v, k) => (
                    <Option key={k} value={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>

              <Form.Item
                name='level'
                rules={[{ required: true, message: 'Vui lòng chọn' }]}
              >
                <VSelect
                  label='Trình độ học vấn'
                  placeholder='Chọn trình độ học vấn'
                  required
                  isHorizal
                >
                  {OpitionLevel.map((v, k) => (
                    <Option key={k} value={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>

              <Form.Item
                name='dayOfBirth'
                rules={[{ required: true, message: 'Vui lòng chọn' }]}
              >
                <VDatePicker
                  format='DD/MM/YYYY'
                  label='Ngày sinh'
                  placeholder='Chọn ngày sinh'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='temporaryAddress'
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <VInput
                  label='Tạm trú'
                  placeholder='Nhập địa chỉ tạm trú'
                  required
                  isHorizal
                />
              </Form.Item>
              <Form.Item
                name='permanentAddress'
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <VInput
                  label='Thường trú '
                  placeholder='Nhập địa chỉ thường trú'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='ethnic'
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <VInput
                  label='Dân tộc'
                  placeholder='Nhập dân tộc'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='religion'
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <VInput
                  label='Tôn giáo'
                  placeholder='Nhập tôn giáo'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='nationality'
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <VInput
                  label='Quốc tịch'
                  placeholder='Nhập quốc tịch'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='marital'
                rules={[{ required: true, message: 'Vui lòng chọn' }]}
              >
                <VSelect
                  label='Tình trạng hôn nhân'
                  placeholder='Chọn tình trạng hôn nhân'
                  required
                  isHorizal
                >
                  {OpitionMatarial.map((v, k) => (
                    <Option key={k} value={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>

              <Form.Item name='element'>
                <VInput
                  label='Thành phần'
                  placeholder='Nhập Thành phần (vd : công nhân viên)'
                  isHorizal
                />
              </Form.Item>
              <Form.Item
                name='email'
                rules={[
                  {
                    type: 'email',
                    message: 'Vui lòng nhập đúng định dạng email',
                  },
                  {
                    required: true,
                    message: 'Please input your E-mail!',
                  },
                ]}
              >
                <VInput
                  label='Email'
                  placeholder='Nhập email'
                  required
                  type='email'
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='emailCompany'
                rules={[
                  {
                    type: 'email',
                    message: 'Vui lòng nhập đúng định dạng email',
                  },
                  {
                    required: true,
                    message: 'Please input your E-mail!',
                  },
                ]}
              >
                <VInput
                  label='Email công ty'
                  placeholder='Nhập địa chỉ email công ty'
                  required
                  type='email'
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='phoneNumber'
                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
              >
                <VInput label='SĐT' placeholder='Nhập SĐT' required isHorizal />
              </Form.Item>

              <Form.Item
                name='phoneCode'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập Mã vùng điện thoại của nước sở tại',
                  },
                ]}
              >
                <VInput
                  label='Mã vùng điện thoại của nước sở tại'
                  placeholder='Nhập Mã vùng điện thoại của nước sở tại'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='peopleId'
                rules={[{ required: true, message: 'Vui lòng nhập CMT/CCCD' }]}
              >
                <VInput
                  label='CMT/CCCD'
                  placeholder='Nhập CMT/CCCD'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='issueDate'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập Ngày phát hành CMT/CCCD',
                  },
                ]}
              >
                <VDatePicker
                  format='DD/MM/YYYY'
                  label='Ngày phát hành CMT/CCCD'
                  placeholder='Nhập Ngày phát hành CMT/CCCD'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='issuePlace'
                rules={[
                  { required: true, message: 'Vui lòng nhập Nơi cấp CMT/CCCD' },
                ]}
              >
                <VInput
                  label='Nơi cấp CMT/CCCD'
                  placeholder='Nhập Nơi cấp CMT/CCCD'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='region'
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng chọn Khu vực làm việc của nhân viên. Chọn theo các thông tin đơn vị của trường quản lý khách hàng',
                  },
                ]}
              >
                <VSelect
                  showSearch
                  label='Khu vực làm việc của nhân viên. Chọn theo các thông tin đơn vị của trường quản lý khách hàng'
                  placeholder='Nhập Khu vực làm việc của nhân viên. Chọn theo các thông tin đơn vị của trường quản lý khách hàng'
                  required
                  isHorizal
                >
                  {OpitionUnits?.map((v: OpitionType) => (
                    <Option key={v.value} value={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>
              <Form.Item name='taxCode'>
                <VInput label='MST' placeholder='Nhập MST' isHorizal />
              </Form.Item>

              <Form.Item name='bankCode'>
                <VInput
                  label='Ngân hàng'
                  placeholder='Nhập Ngân hàng'
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='bankAccountNumber'>
                <VInput
                  label='Số thẻ NH'
                  placeholder='Nhập Số thẻ NH'
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='socialInsuranceId'>
                <VInput label='Mã BHXH' placeholder='Nhập Mã BHXH' isHorizal />
              </Form.Item>

              <Form.Item name='healthInsuranceId'>
                <VInput label='Mã BHYT' placeholder='Nhập Mã BHYT' isHorizal />
              </Form.Item>

              <Form.Item name='insuranceParticipationDate'>
                <VDatePicker
                  label='Ngày vào làm việc'
                  placeholder='Nhập Ngày vào làm việc'
                  format='DD/MM/YYYY'
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='issueInsuranceDate'>
                <VDatePicker
                  label='Ngày vào kí hợp đồng chính thức'
                  placeholder='Nhập Ngày vào kí hợp đồng chính thức'
                  format='DD/MM/YYYY'
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='latestPromotionDate'>
                <VDatePicker
                  label='Ngày lên chức vụ mới gần đây'
                  placeholder='Nhập Ngày lên chức vụ mới gần đây'
                  format='DD/MM/YYYY'
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='files' className='space-y-1'>
                <p className='m-0 p-0'>File</p>
                <FileUpload
                  handleSetFileList={handleSetFileList}
                  fileList={fileList}
                />
              </Form.Item>

              <Form.Item name='unionBookNumber'>
                <VInput label='Ghi chú' placeholder='Nhập ghi chú' isHorizal />
              </Form.Item>
            </div>
          </div>

          <div className='mt-4 flex justify-start'>
            <Button
              onClick={onSubmit}
              loading={isCreating}
              htmlType='submit'
              type='primary'
            >
              Tạo mới nhân viên
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalCreateEmployee;
