/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoComplete, Form, FormInstance, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import { countries } from '@/contants/types/Country';
import { getPostalCode } from '@/services/booking.services';
import {
  MAX_14_TEXT,
  MAX_35_TEXT,
  MAX_60_TEXT,
  split35String,
} from '@/utils/common-function';

import VInput from '../common/VInput';
import VSelect from '../common/VSelect';
import ShowPostCodeVN from '../ShowPostCodeVN';

const { Option } = Select;

const FormAddressSender = ({ form }: { form: FormInstance }) => {
  const [search, setSeach] = useState<string | undefined>();
  const { data: dataPostalCode } = useQuery([search, 'adress-sender'], () =>
    getPostalCode({ search })
  );
  const { t } = useTranslation('booking');
  const senderCountry = Form.useWatch('senderCountry', form);

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
    form.setFieldValue('senderPostalCode', value);
    setSeach(value);
  };

  const handleSelect = () => {
    form.setFieldValue('senderProvince', dataPostalCode?.cityName);
    form.setFieldValue('senderPostalCode', dataPostalCode?.value);
    form.setFieldValue('senderCountry', dataPostalCode?.countryName);
    form.setFieldValue('senderTown', dataPostalCode?.townName);
  };

  return (
    <Form className='grid grid-cols-2 gap-4 xs:grid-cols-1' form={form}>
      <Form.Item
        name='senderCountry'
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
        <Form.Item name='senderPostalCode'>
          <AutoComplete
            options={opition}
            onSelect={handleSelect}
            placeholder='XXX-XXX'
            data-pattern='xx-xxx'
            maxLength={8}
            disabled={!senderCountry}
            onSearch={(e) => {
              form.setFieldValue('senderPostalCode', e);
              setSeach(e);
            }}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            onKeyDown={(e) => handleChangeMaskUpInput(e.target.value)}
          />
        </Form.Item>
        <ShowPostCodeVN />
      </div>

      <Form.Item
        name='senderProvince'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập Tỉnh',
          },
          {
            max: 35,
            message: MAX_35_TEXT,
          },
        ]}
      >
        <VInput
          label={t('Province')}
          required
          isHorizal
          disabled={!senderCountry}
          placeholder={t('Maximum 35 characters')}
        />
      </Form.Item>

      <Form.Item
        name='senderTown'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập Quận/huyện',
          },
          {
            max: 35,
            message: MAX_35_TEXT,
          },
        ]}
      >
        <VInput
          label={t('District')}
          placeholder={t('Maximum 35 characters')}
          required
          isHorizal
          disabled={!senderCountry}
        />
      </Form.Item>

      <Form.Item
        name='senderNameEn'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập tên công ty gửi',
          },
          {
            max: 60,
            message: MAX_60_TEXT,
          },
        ]}
      >
        <VInput
          label={t("Sender's company name")}
          required
          placeholder={t('Maximum length 60 characters')}
          isHorizal
          disabled={!senderCountry}
        />
      </Form.Item>

      <Form.Item
        name='senderContactPerson'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập tên người gửi hàng',
          },
          {
            max: 35,
            message: MAX_35_TEXT,
          },
        ]}
      >
        <VInput
          label={t("Sender's name")}
          required
          isHorizal
          disabled={!senderCountry}
          placeholder={t('Maximum 35 characters')}
          maxLength={35}
        />
      </Form.Item>

      <Form.Item
        name='senderAddressEn1'
        validateTrigger={['onBlur', 'onFocus', 'onChange']}
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập địa chỉ chi tiết 1',
          },
        ]}
      >
        <VInput
          label={t('DetailedAddress1')}
          required
          isHorizal
          placeholder={t('Maximum 35 characters')}
          disabled={!senderCountry}
          onChange={(e) => {
            split35String(
              35,
              e.target.value,
              form,
              'senderAddressEn1',
              'senderAddressEn2'
            );
          }}
        />
      </Form.Item>

      <Form.Item
        name='senderAddressEn2'
        validateTrigger={['onBlur', 'onFocus', 'onChange']}
        dependencies={['senderAddressEn1']}
        rules={[
          () => ({
            validator(_, value) {
              if (value?.length > 35) {
                return Promise.reject(new Error('Độ dài tối đa 35 kí tự'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <VInput
          label={t('DetailedAddress2')}
          placeholder={t('Maximum 35 characters')}
          isHorizal
          disabled={!senderCountry}
        />
      </Form.Item>

      <Form.Item
        name='senderAddressEn3'
        rules={[
          {
            max: 35,
            message: MAX_35_TEXT,
          },
        ]}
      >
        <VInput
          label={t('DetailedAddress3')}
          placeholder={t('Maximum 35 characters')}
          isHorizal
          disabled={!senderCountry}
        />
      </Form.Item>

      <Form.Item
        name='senderPhoneNumber'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập số điện thoại gửi',
          },
          {
            max: 14,
            message: MAX_14_TEXT,
          },
        ]}
      >
        <VInput
          label={t('Sending phone number')}
          required
          placeholder={t('Maximum 14 characters')}
          isHorizal
          disabled={!senderCountry}
        />
      </Form.Item>

      <Form.Item
        name='senderPhoneNumber2'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập số điện thoại gửi',
          },
          {
            max: 14,
            message: MAX_14_TEXT,
          },
        ]}
      >
        <VInput
          label={t('Sending Phone Number 2')}
          isHorizal
          placeholder={t('Maximum 14 characters')}
          disabled={!senderCountry}
        />
      </Form.Item>
    </Form>
  );
};

export default FormAddressSender;
