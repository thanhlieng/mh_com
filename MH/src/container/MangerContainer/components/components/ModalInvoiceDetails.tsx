/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import VInputNumber from '@/components/common/VInputNumber';
import VSelect from '@/components/common/VSelect';

import { UnitOfMeasure } from '@/contants/types';
import { countries } from '@/contants/types/Country';

type ModalInvoiceDetailsProps = {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  handleAddInvoiceDetails: (form: any) => void;
};

const { Option } = Select;

const ModalInvoiceDetails = ({
  isOpen,
  onClose,
  handleAddInvoiceDetails,
}: ModalInvoiceDetailsProps) => {
  const [invoiceDetailsForm] = Form.useForm();

  const handleChange = () => {
    const quantity = invoiceDetailsForm.getFieldValue('quantity');
    const price = invoiceDetailsForm.getFieldValue('price');
    const totalMoney = price * quantity;
    invoiceDetailsForm.setFieldsValue({ totalMoney });
  };

  const OpitionUnitOfMeasure = Object.entries(UnitOfMeasure).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  const handleDetails = async (form: any) => {
    const resForm = await form.validateFields();
    handleAddInvoiceDetails(resForm);
  };

  const { t } = useTranslation('booking');

  return (
    <Modal
      footer={null}
      visible={isOpen}
      title={
        <HeaderModal
          title={t('Invoice Details')}
          onClose={() => onClose(false)}
        />
      }
      destroyOnClose
      onCancel={() => {
        invoiceDetailsForm.resetFields();
        onClose(false);
      }}
      closable={false}
      className='top-[80px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <div className='bg-[#ffff] xs:h-screen'>
        <Form form={invoiceDetailsForm}>
          <div className=' overflow-y-auto p-5'>
            <div className='grid grid-cols-2 gap-x-6 xs:grid-cols-1'>
              <Form.Item
                name='goodsName'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập Tên hàng hóa (Tiếng Anh)',
                  },
                ]}
              >
                <VInput
                  label={t('Name of goods (English)')}
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='describe'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mô tả hàng hóa',
                  },
                ]}
              >
                <VInput label={t('Description of goods')} required isHorizal />
              </Form.Item>
              <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
                <Form.Item
                  name='originOfGoods'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn xuất xứ',
                    },
                  ]}
                >
                  <VSelect
                    label={t('Origin of Goods to Be Shipped')}
                    required
                    showSearch
                    isHorizal
                  >
                    {countries.map((v) => (
                      <Option value={v.value} key={v.value}>
                        {v.label}
                      </Option>
                    ))}
                  </VSelect>
                </Form.Item>
                <Form.Item
                  name='quantity'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập số lượng hàng hóa',
                    },
                  ]}
                >
                  <VInputNumber
                    label={t('Quantity')}
                    required
                    onChange={handleChange}
                    isHorizal
                  />
                </Form.Item>
              </div>

              <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
                <Form.Item name='unitOfMeasure'>
                  <VSelect label={t('Unit of measurement')} required isHorizal>
                    {OpitionUnitOfMeasure.map((v) => (
                      <Select.Option value={v.value} key={v.value}>
                        {v.label}
                      </Select.Option>
                    ))}
                  </VSelect>
                </Form.Item>

                <Form.Item
                  name='price'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập Giá',
                    },
                  ]}
                >
                  <VInputNumber
                    label={t('Unit Price')}
                    required
                    isHorizal
                    onChange={handleChange}
                  />
                </Form.Item>
              </div>

              <Form.Item name='HSCode'>
                <VInput label='HS Code' isHorizal />
              </Form.Item>

              <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
                <Form.Item
                  name='weight'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập cân nặng',
                    },
                  ]}
                >
                  <VInputNumber label={t('Weight')} required isHorizal />
                </Form.Item>

                <Form.Item name='totalMoney'>
                  <VInputNumber
                    label={t('Total amount')}
                    disabled
                    isHorizal
                    formatter={(value) =>
                      value !== undefined && value !== null
                        ? Number(value).toFixed(2)
                        : '0.00'
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className='flex justify-center'>
            <Button
              className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
              onClick={() => {
                handleDetails(invoiceDetailsForm);
                onClose(false);
              }}
            >
              {t('Create new invoice')}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalInvoiceDetails;
