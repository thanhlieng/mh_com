import { Divider, Form, FormInstance, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';

import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';

import { countries } from '@/contants/types/Country';
const { Option } = Select;
const AddressDetails = ({ form }: { form: FormInstance }) => {
  const { t } = useTranslation('booking');
  return (
    <div className='mb-24'>
      <Form form={form}>
        <p className='m-0 p-0 font-bold'>1.Địa chỉ người gửi</p>
        <Divider className='bg-yellow' />
        <div className='grid grid-cols-2 gap-x-6'>
          <Form.Item name='senderNameVi'>
            <VInput
              label='Tên công ty gửi (Tiếng Việt)'
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='senderNameEn'>
            <VInput label='Tên công ty gửi (Tiếng Anh)' disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderContactPerson'>
            <VInput label='Tên người gửi hàng' disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderDepartment'>
            <VInput label='Phòng ban gửi' disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderAddressVi'>
            <VInput
              label='Địa chỉ chi tiết (Tiếng Việt)'
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='senderAddressEn1'>
            <VInput label={t('Detailed address 1')} disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderAddressEn2'>
            <VInput label={t('DetailedAddress2')} disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderAddressEn3'>
            <VInput label={t('DetailedAddress2')} disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderPhoneNumber'>
            <VInput label='Số điện thoại gửi' required disabled isHorizal />
          </Form.Item>
          <Form.Item name='senderPhoneNumber2'>
            <VInput
              label={t('Sending Phone Number 2')}
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='senderProvince'>
            <VInput label='Tỉnh' disabled isHorizal />
          </Form.Item>
          <Form.Item name='senderTown'>
            <VInput label='Thành phố/Quận/Huyện' disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderCountry'>
            <VSelect label={t('Country')} required disabled isHorizal>
              {countries.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item name='senderPostalCode'>
            <VInput label='Mã bưu chính (postcode)' disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderNote'>
            <VInput label='Ghi chú' disabled isHorizal />
          </Form.Item>

          <Form.Item name='senderOtherShippingAddress'>
            <VInput
              label={t(
                "Shipping address is different from the sender's address (if any)"
              )}
              disabled
              isHorizal
            />
          </Form.Item>
        </div>

        <p className='m-0 p-0 font-bold'>2.Địa chỉ người nhận</p>
        <Divider className='bg-yellow' />

        <div className='grid grid-cols-2 gap-x-6'>
          <Form.Item name='receiverName'>
            <VInput
              label={t('Receiving company name')}
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='receiverContactPerson'>
            <VInput label='Người nhận hàng' required disabled isHorizal />
          </Form.Item>

          <Form.Item name='receiverDepartment'>
            <VInput label={t('Receiving department')} disabled isHorizal />
          </Form.Item>

          <Form.Item name='receiverAddress1'>
            <VInput
              label='Địa chỉ nhận hàng chi tiết'
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='receiverAddress2'>
            <VInput
              label={t('Detailed receiving address 2')}
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='receiverAddress3'>
            <VInput
              label={t('Detailed receiving address 3')}
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='receiverProvince'>
            <VInput label={t('City/District/County')} disabled isHorizal />
          </Form.Item>

          <Form.Item name='receiverTown'>
            <VInput label='Thành phố/Quận/Huyện' disabled isHorizal />
          </Form.Item>

          <Form.Item name='receiverPostalCode'>
            <VInput
              label='Mã bưu chính (postcode)'
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='receiverCountry'>
            <VSelect
              label={t('Country')}
              required
              showSearch
              disabled
              isHorizal
            >
              {countries.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item name='receiverPhoneNumber'>
            <VInput
              label='Số điện thoại người nhận'
              required
              disabled
              isHorizal
            />
          </Form.Item>

          <Form.Item name='receiverPhoneNumber2'>
            <VInput label='Số điện thoại người nhận 2' disabled isHorizal />
          </Form.Item>

          <Form.Item name='receiverNote'>
            <VInput label='Ghi chú' disabled isHorizal />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default AddressDetails;
