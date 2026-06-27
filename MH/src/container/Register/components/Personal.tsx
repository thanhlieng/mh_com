/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
import { Form, notification, Select } from 'antd';
import { Col, Row } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';

import { personRegister } from '@/services/register.services';

const { Option } = Select;

const Personal = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  const [personForm] = Form.useForm();
  const { mutate: personRegis } = useMutation(personRegister, {
    onSuccess: () => {
      queryClient.invalidateQueries(['generateBill']);
      notification.success({
        message:
          'Yêu cầu của quý khách đã được gửi đến nhân viên.Nhân viên sẽ liên hệ cho quý khách ngay bây giờ. MH Great Sun xin cảm ơn',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'lỗi, vui lòng thử lại sau',
        placement: 'top',
      });
    },
  });
  const handleSubmit = async () => {
    const value = await personForm.validateFields();
    personRegis({ ...value });
  };

  return (
    <div className='mt-[10px] w-full p-[20px_0] px-[15px]'>
      <Form form={personForm}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name='fullName'
              rules={[
                {
                  required: true,
                  message: `${t('MFLname')}`,
                },
              ]}
            >
              <VInput
                required
                placeholder={t('MrA')}
                label={t('FLname')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name='gender'
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <VSelect
                required
                placeholder={t('SelectGender')}
                label={t('Gender')}
                isHorizal
                className=' csSelect rounded-[12px] '
              >
                <Option value='Male'>{t('Male')}</Option>
                <Option value='Female'>{t('Female')}</Option>
              </VSelect>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name='detailAddress'
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <VInput
                required
                placeholder={t('EnterAddress')}
                label={t('Address')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} className='pt-[16px]'>
            <Form.Item
              name='dob'
              rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
              className='flex flex-col'
            >
              <VDatePicker
                required
                format='DD/MM/YYYY'
                placeholder='Nhập ngày sinh'
                label={t('Birthday')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name='email'
              rules={[
                {
                  type: 'email',
                  message: `${t('MVemail')}`,
                },
                {
                  required: true,
                  message: `${t('MIemail')}`,
                },
              ]}
            >
              <VInput
                required
                type='text'
                placeholder={t('EnterEmail')}
                label='Email'
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name='phoneNumber'
              rules={[
                {
                  required: true,
                  message: `${t('Mphone')}`,
                },
              ]}
            >
              <VInput
                required
                type='text'
                label={t('PhoneNumber')}
                placeholder={t('EnterPhone')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            onClick={handleSubmit}
            className='cs rounded-[12px] bg-yellow-secondary px-[20px] py-[10px] text-[#fff]'
          >
            <p className='m-0 p-0 text-[14px] leading-[17px]'>
              {t('Register')}
            </p>
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Personal;
