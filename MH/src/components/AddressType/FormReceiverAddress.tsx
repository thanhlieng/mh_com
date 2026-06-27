/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoComplete, Form, FormInstance, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import { countries } from '@/contants/types/Country';
import { getPostalCode } from '@/services/booking.services';
import { MAX_60_TEXT, split35String } from '@/utils/common-function';

import VInput from '../common/VInput';
import VSelect from '../common/VSelect';
import ShowPostCodeVN from '../ShowPostCodeVN';

const { Option } = Select;

const FormReceiverAddress = ({ form }: { form: FormInstance }) => {
  const [search, setSeach] = useState<string | undefined>();
  const { t } = useTranslation('booking');
  const { data: dataPostalCode } = useQuery([search, 'adress-recever'], () =>
    getPostalCode({ search })
  );
  const opition = useMemo(() => {
    if (dataPostalCode) {
      return [
        { value: dataPostalCode?.value, label: dataPostalCode?.displayName },
      ];
    } else {
      return [];
    }
  }, [dataPostalCode]);

  const handleChangeMaskUpInput = (evt: any) => {
    const value = evt.replace(/^(\d{3})(\d{3})/, '$1-$2');
    form.setFieldValue('receiverPostalCode', value);
    setSeach(value);
  };

  const handleSelect = () => {
    form.setFieldValue('receiverProvince', dataPostalCode?.cityName);
    form.setFieldValue('receiverPostalCode', dataPostalCode?.value);
    form.setFieldValue('receiverCountry', dataPostalCode?.countryName);
    form.setFieldValue('receiverTown', dataPostalCode?.townName);
  };

  const receiverCountry = Form.useWatch('receiverCountry', form);

  return (
    <Form className='grid grid-cols-2 gap-4 xs:grid-cols-1' form={form}>
      <Form.Item
        name='receiverCountry'
        rules={[{ required: true, message: 'Vui lòng chọn quốc gia' }]}
      >
        <VSelect label={t('Country')} required isHorizal showSearch>
          {countries.map((v) => (
            <Option value={v.value} key={v.value}>
              {v.label}
            </Option>
          ))}
        </VSelect>
      </Form.Item>
      <div className='space-y-1'>
        <p className='m-0 p-0'>
          {t('Postal code')}
          <span className='text-red-700'>*</span>
        </p>
        <Form.Item name='receiverPostalCode'>
          <AutoComplete
            options={opition}
            onSelect={handleSelect}
            maxLength={8}
            disabled={!receiverCountry}
            placeholder='XXX-XXXX'
            data-pattern='xx-xxx'
            onSearch={(e) => {
              form.setFieldValue('receiverPostalCode', e);
              setSeach(e);
            }}
            onKeyDown={(e) => handleChangeMaskUpInput((e.target as any).value)}
          />
        </Form.Item>
        <ShowPostCodeVN />
      </div>

      <Form.Item
        name='receiverProvince'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập Tỉnh',
          },
          {
            max: 35,
            message: t('Maximum 35 characters'),
          },
        ]}
      >
        <VInput
          label={t('Province')}
          required
          isHorizal
          disabled={!receiverCountry}
          placeholder={t('Maximum 35 characters')}
        />
      </Form.Item>
      <Form.Item
        name='receiverTown'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập Quận/huyện',
          },
          {
            max: 35,
            message: t('Maximum 35 characters'),
          },
        ]}
      >
        <VInput
          label={t('District')}
          required
          isHorizal
          disabled={!receiverCountry}
        />
      </Form.Item>
      <Form.Item
        name='receiverName'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập tên công ty nhận',
          },
          {
            max: 60,
            message: MAX_60_TEXT,
          },
        ]}
      >
        <VInput
          label={t('Receiving company name')}
          required
          isHorizal
          disabled={!receiverCountry}
          placeholder={t('Maximum length 60 characters')}
        />
      </Form.Item>

      <Form.Item
        name='receiverContactPerson'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập người nhận hàng',
          },
          {
            max: 35,
            message: t('Maximum 35 characters'),
          },
        ]}
      >
        <VInput
          label={t('Recipient')}
          required
          placeholder={t('Maximum 35 characters')}
          isHorizal
          disabled={!receiverCountry}
        />
      </Form.Item>

      <Form.Item
        name='receiverAddress1'
        validateTrigger={['onBlur', 'onFocus', 'onChange']}
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập địa chỉ nhận hàng chi tiết ',
          },
        ]}
      >
        <VInput
          label={t('Detailed receiving address 1')}
          required
          placeholder={t('Maximum 35 characters')}
          isHorizal
          disabled={!receiverCountry}
          onChange={(e) =>
            split35String(
              35,
              e.target.value,
              form,
              'receiverAddress1',
              'receiverAddress2'
            )
          }
        />
      </Form.Item>

      <Form.Item
        name='receiverAddress2'
        validateTrigger={['onBlur', 'onFocus', 'onChange']}
        rules={[
          () => ({
            validator(_, value) {
              if (value?.length > 35) {
                return Promise.reject(new Error(t('Maximum 35 characters')));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <VInput
          label={t('Detailed receiving address 2')}
          isHorizal
          placeholder={t('Maximum 35 characters')}
          disabled={!receiverCountry}
        />
      </Form.Item>

      <Form.Item
        name='receiverAddress3'
        rules={[
          {
            max: 35,
            message: t('Maximum 35 characters'),
          },
        ]}
      >
        <VInput
          label={t('Detailed receiving address 3')}
          isHorizal
          placeholder={t('Maximum 35 characters')}
          disabled={!receiverCountry}
        />
      </Form.Item>

      <Form.Item
        name='receiverPhoneNumber'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập số điện thoại nhận',
          },
          {
            max: 14,
            message: t('Maximum 14 characters'),
          },
        ]}
      >
        <VInput
          label={t('Recipient phone number')}
          required
          placeholder={t('Maximum 14 characters')}
          isHorizal
          disabled={!receiverCountry}
        />
      </Form.Item>

      <Form.Item
        name='receiverPhoneNumber2'
        rules={[
          {
            max: 14,
            message: t('Maximum 14 characters'),
          },
        ]}
      >
        <VInput
          label={t('Recipient phone number 2')}
          isHorizal
          disabled={!receiverCountry}
          placeholder={t('Maximum 14 characters')}
        />
      </Form.Item>
    </Form>
  );
};

export default FormReceiverAddress;
