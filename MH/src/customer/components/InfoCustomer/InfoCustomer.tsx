/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, FormInstance, Select } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';

import {
  CustomerStatus,
  CustomerType,
  ECustomerGroup,
  EIdentifierType,
  NetWorkCustomerType,
  OpitionType,
} from '@/contants/types';
import {
  getCompanies,
  getServices,
  getUnit,
} from '@/services/customer.services';
import { countries } from '@/contants/types/Country';

const { Option } = Select;
const InfoCustomer = ({ form }: { form: FormInstance }) => {
  const { t } = useTranslation('booking');
  const { data: dataCompanies } = useQuery(['getCompanies', {}], () =>
    getCompanies()
  );
  const { data: dataGetServices } = useQuery(['getServices', {}], () =>
    getServices()
  );
  const { data: dataUnits } = useQuery(['getUnit', {}], () => getUnit());

  const OpitionCompanies = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataCompanies?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataCompanies?.map((v) => ({
        value: v.id,
        label: `${v.name}`,
      }));
    }
  }, [dataCompanies]);

  const OpitionServices = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataGetServices?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataGetServices?.map((v) => ({
        value: v.id,
        label: `${v.name}`,
      }));
    }
  }, [dataGetServices]);

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

  const OpitionCustomerType = Object.entries(CustomerType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  const OpitionNetWorkCustomerType = Object.entries(NetWorkCustomerType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const OpitionCustomerStatus = Object.entries(CustomerStatus).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const IdentifierOpition = Object.entries(EIdentifierType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const ECustomerGroupOpition = Object.entries(ECustomerGroup).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  return (
    <Form form={form}>
      <div className='h-[calc(70vh)] overflow-y-auto p-4'>
        <div className='grid grid-cols-2 gap-x-6'>
          <Form.Item name='status'>
            <VSelect
              label='Tình trạng khách hàng'
              required
              placeholder='Tình trạng khách hàng'
              isHorizal
            >
              {OpitionCustomerStatus.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
          <Form.Item
            name='fullName'
            rules={[{ required: true, message: 'Vui lòng nhập hàng' }]}
          >
            <VInput
              label='Tên khách hàng'
              required
              placeholder='Nhập tên khách hàng'
              isHorizal
            />
          </Form.Item>

          <Form.Item name='fullNameEn'>
            <VInput
              label='Tên khách hàng(Tiếng Anh)'
              placeholder='Nhập tên khách hàng (Tiếng Anh)'
              isHorizal
            />
          </Form.Item>

          <Form.Item name='detailAddressEn'>
            <VInput
              label='Địa chỉ khách hàng(Tiếng Anh)'
              placeholder='Nhập địa chỉ khách hàng (Tiếng Anh)'
              isHorizal
            />
          </Form.Item>

          <Form.Item
            name='companyId'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn Công ty quản lý khách hàng',
              },
            ]}
          >
            <VSelect label='Công ty quản lý khách hàng' required isHorizal>
              {OpitionCompanies?.map((v: any) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='unitId'
            rules={[
              { required: true, message: 'Vui lòng chọn thông tin đơn vị' },
            ]}
          >
            <VSelect label='Thông tin đơn vị' required showSearch isHorizal>
              {OpitionUnits?.map((v: any) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item name='customerGroup'>
            <VSelect
              label='Nhóm khách hàng hoặc nhà cung cấp'
              required
              isHorizal
            >
              {ECustomerGroupOpition.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='detailAddress'
            rules={[{ required: true, message: 'Vui lòng địa chỉ chi tiết' }]}
          >
            <VInput
              label='Địa chỉ chi tiết'
              required
              placeholder='Nhập địa chỉ chi tiết'
              isHorizal
            />
          </Form.Item>

          <Form.Item name='commune'>
            <VInput label='Xã/Phường' placeholder='Nhập xã/phường' isHorizal />
          </Form.Item>

          <Form.Item name='district'>
            <VInput
              label='Quận/Huyện'
              isHorizal
              placeholder='Nhập quận/huyện '
            />
          </Form.Item>
          <Form.Item name='province'>
            <VInput
              label='Tỉnh'
              isHorizal
              placeholder={t('Maximum 35 characters')}
            />
          </Form.Item>
          <Form.Item
            name='country'
            rules={[{ required: true, message: 'Vui lòng Quốc gia ' }]}
          >
            <VSelect label={t('Country')} required isHorizal showSearch>
              {countries.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
          <Form.Item
            name='identifierType'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập loại mã định danh',
              },
            ]}
          >
            <VSelect label='Loại mã định danh' required isHorizal>
              {IdentifierOpition.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='identifier'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mã định danh',
              },
            ]}
          >
            <VInput label='Mã định danh' required isHorizal />
          </Form.Item>

          <Form.Item
            name='contactPerson'
            rules={[
              {
                required: true,
                message: 'Vui lòng Người liên hệ của công ty ',
              },
            ]}
          >
            <VInput
              label='Người liên hệ của công ty'
              required
              placeholder='Nhập Người liên hệ của công ty'
              isHorizal
            />
          </Form.Item>
          <Form.Item
            name='phoneNumber'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập sđt công ty',
              },
            ]}
          >
            <VInput
              label='SĐT cố định'
              required
              placeholder='Nhập SĐT cố định'
              isHorizal
            />
          </Form.Item>

          <Form.Item
            name='mobile'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập số di đông',
              },
            ]}
          >
            <VInput
              label='Số di dộng'
              required
              placeholder='Nhập số di động '
              isHorizal
            />
          </Form.Item>

          <Form.Item name='fax'>
            <VInput label='Số Fax' placeholder='Nhập số fax ' isHorizal />
          </Form.Item>

          <Form.Item name='website'>
            <VInput
              label='Website'
              placeholder='Nhập địa chỉ website '
              isHorizal
            />
          </Form.Item>

          <Form.Item name='phoneCode'>
            <VInput label='Mã vùng' placeholder='Nhập mã vùng' isHorizal />
          </Form.Item>
          <Form.Item
            name='email'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập email',
              },
            ]}
          >
            <VInput
              label='Email'
              required
              placeholder='Nhập mã email'
              isHorizal
            />
          </Form.Item>
          <Form.Item
            name='typeCustomer'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập Loại khách hàng',
              },
            ]}
          >
            <VSelect
              label='Loại khách hàng'
              required
              placeholder='Nhập  Loại khách hàng'
              isHorizal
            >
              {OpitionCustomerType.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='service'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập Dịch vụ sử dụng',
              },
            ]}
          >
            <VSelect
              label='Dịch vụ sử dụng'
              required
              mode='multiple'
              placeholder='Nhập loại Dịch vụ sử dụng'
              isHorizal
            >
              {OpitionServices?.map((v: OpitionType) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='type'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập Loại khách hàng vào mạng',
              },
            ]}
          >
            <VSelect
              label='Loại khách hàng vào mạng'
              required
              placeholder='Nhập Loại khách hàng vào mạng'
              isHorizal
            >
              {OpitionNetWorkCustomerType.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
          <Form.Item name='postCode'>
            <VInput
              label='Mã bưu chính'
              placeholder='Nhập Mã bưu chính'
              isHorizal
            />
          </Form.Item>
          {/* <Form.Item name='state'>
            <VInput label='Tiểu bang' placeholder='Nhập Tiểu bang' isHorizal />
          </Form.Item> */}
          <Form.Item name='openDate'>
            <VDatePicker
              format='DD/MM/YYYY'
              label='Ngày mở mã/ Active lại'
              placeholder='Nhập Ngày mở mã/ Active lại'
              defaultValue={moment(new Date(), 'DD/MM/YYYY')}
              required
              isHorizal
            />
          </Form.Item>
          <Form.Item name='note'>
            <VInput label='Ghi chú' placeholder='Nhập ghi chú' isHorizal />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default InfoCustomer;
