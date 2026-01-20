import { Col, Form, notification } from 'antd';
import { Row } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import VInput from '@/components/common/VInput';

import { companyRegister } from '@/services/register.services';

const Coprorate = () => {
  const { t } = useTranslation('common');

  const queryClient = useQueryClient();

  const [company] = Form.useForm();
  const { mutate: companyRegis } = useMutation(companyRegister, {
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
  const onSubmit = async () => {
    const value = await company.validateFields();
    companyRegis({ ...value });
  };
  return (
    <div className='w-full p-[15px]'>
      <Form form={company}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name='fullName'
              rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
            >
              <VInput
                required
                label={t('CompanyName')}
                className='h-[38px] rounded-[12px] '
                placeholder='Cong ty TNHH'
                isHorizal
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name='detailAddress'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập địa chỉ công ty',
                },
              ]}
            >
              <VInput
                required
                placeholder={t('Address')}
                className='h-[38px] rounded-[12px]'
                label={t('Address')}
                isHorizal
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name='tel'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập sddt công ty',
                },
              ]}
            >
              <VInput
                required
                placeholder={t('Tel')}
                label={t('Tel')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name='taxCode'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tax code',
                },
              ]}
            >
              <VInput
                required
                label={t('TaxCode')}
                placeholder={t('TaxCode')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name='contactPerson'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên',
                },
              ]}
            >
              <VInput
                required
                label={t('ContactName')}
                placeholder={t('Name')}
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
                  message: 'Vui lòng nhập sđt',
                },
              ]}
            >
              <VInput
                required
                placeholder={t('Phonenumber')}
                type='text'
                label={t('PhoneNumber')}
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name='position'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập chức danh',
                },
              ]}
            >
              <VInput
                required
                placeholder={t('Position')}
                label={t('Position')}
                className='h-[38px] rounded-[12px]'
                isHorizal
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
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
                required
                label={t('Email')}
                placeholder={t('Email')}
                type='email'
                isHorizal
                className='h-[38px] rounded-[12px]'
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            onClick={onSubmit}
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

export default Coprorate;
