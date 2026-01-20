/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useMemo } from 'react';
import { useQuery } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import VInputNumber from '@/components/common/VInputNumber';
import VSelect from '@/components/common/VSelect';

import { CalculationUnit } from '@/contants/common.constants';
import { OpitionType } from '@/contants/types';
import { countries } from '@/contants/types/Country';
import {
  calculateBulkyWeight,
  fetchCommoditiesTypeId,
} from '@/services/booking.services';

type ModalBookingDetailsProps = {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  handleAddBookingDetails: (form: any) => void;
  services?: string;
  listServices: Array<OpitionType>;
};

const { Option } = Select;

const ModalBookingDetails = ({
  isOpen,
  services,
  listServices,
  onClose,
  handleAddBookingDetails,
}: ModalBookingDetailsProps) => {
  const [detailsBookingForm] = Form.useForm();

  const { data: DataCommoditiesTypeId } = useQuery(
    ['DataCommoditiesTypeId', {}],
    () => fetchCommoditiesTypeId()
  );
  const { t } = useTranslation('booking');

  const handleChange = async () => {
    const width = detailsBookingForm.getFieldValue('width');
    const height = detailsBookingForm.getFieldValue('height');
    const longs = detailsBookingForm.getFieldValue('longs');
    const quantity = detailsBookingForm.getFieldValue('quantity');

    const bulkyWeightResult = await calculateBulkyWeight({
      serviceId: services,
      width: width,
      height: height,
      longs: longs,
      form: 'MH/src/container/MangerContainer/components/components/ModalBookingDeatails.tsx',
    });

    detailsBookingForm.setFieldsValue({ bulkyWeight: bulkyWeightResult });
    const numb22 = bulkyWeightResult * quantity || 0;

    detailsBookingForm.setFieldsValue({ numb22: numb22 });
  };

  const handleAddBooking = async () => {
    const resForm = await detailsBookingForm.validateFields();
    handleAddBookingDetails(resForm);
  };

  const OpitionCalculationUnit = Object.entries(CalculationUnit).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  const OpitionCommoditiesTypeId = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (DataCommoditiesTypeId?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return DataCommoditiesTypeId?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [DataCommoditiesTypeId]);
  return (
    <Modal
      footer={null}
      visible={isOpen}
      title={
        <HeaderModal
          title={t('Create new order details for each package')}
          onClose={() => onClose(false)}
        />
      }
      destroyOnClose
      onCancel={() => onClose(false)}
      closable={false}
      className='top-[80px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <p className='p-5 font-bold'>{t('NoteBooking')}</p>
      <div>
        <Form form={detailsBookingForm}>
          <div className=' overflow-y-auto px-5'>
            <div className='grid grid-cols-2 gap-x-6 xs:grid-cols-1'>
              <Form.Item
                name='commoditiesTypeId'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: `${t('PlsInput')} ${t(
                      'Group of transported goods'
                    )}`,
                  },
                ]}
              >
                <VSelect
                  label={t('Group of transported goods')}
                  required
                  showSearch
                  isHorizal
                >
                  {OpitionCommoditiesTypeId?.map((v: any) => (
                    <Option value={v.value} key={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>

              <Form.Item
                name='description'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: `${'PlsInput'} ${t(
                      'Detailed description of goods (Vietnamese)'
                    )}`,
                  },
                ]}
              >
                <VInput
                  label={t('Detailed description of goods (Vietnamese)')}
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item
                name='shippingItemEn'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: `${t('PlsInput')} ${t(
                      'Transported goods (English)'
                    )}`,
                  },
                ]}
              >
                <VInput
                  label={t('Transported goods (English)')}
                  required
                  isHorizal
                />
              </Form.Item>

              <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
                <Form.Item
                  name='originItem'
                  className='w-full'
                  rules={[
                    {
                      required: true,
                      message: `${t('PlsInput')} ${t('Origin of goods')}`,
                    },
                  ]}
                >
                  <VSelect
                    label={t('Origin of goods')}
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
                      message: `${t('PlsInput')} ${t('Number of packages')}`,
                    },
                  ]}
                >
                  <VInputNumber
                    label={t('Number of packages')}
                    required
                    isHorizal
                    onChange={handleChange}
                  />
                </Form.Item>
              </div>

              <div className='grid grid-cols-3 gap-4 xs:grid-cols-1'>
                <Form.Item name='longs'>
                  <VInputNumber
                    label={t('Length (cm)')}
                    onChange={handleChange}
                    required
                    isHorizal
                  />
                </Form.Item>
                <Form.Item name='width'>
                  <VInputNumber
                    label={t('Width (cm)')}
                    onChange={handleChange}
                    required
                    isHorizal
                  />
                </Form.Item>
                <Form.Item name='height'>
                  <VInputNumber
                    label={t('Height (cm)')}
                    onChange={handleChange}
                    required
                    isHorizal
                  />
                </Form.Item>
              </div>

              <Form.Item name='weight'>
                <VInputNumber
                  label={t('Total actual weight (kg)')}
                  required
                  isHorizal
                  onChange={handleChange}
                />
              </Form.Item>

              <Form.Item name='bulkyWeight'>
                <VInputNumber
                  label={t('Provisional bulky weight (kg)')}
                  required
                  disabled
                  isHorizal
                  formatter={(value) =>
                    value !== undefined && value !== null
                      ? Number(value).toFixed(2)
                      : '0.00'
                  }
                />
              </Form.Item>

              <Form.Item name='numb22'>
                <VInputNumber
                  label={t('Total bulky weight (kg)')}
                  required
                  disabled
                  isHorizal
                  formatter={(value) =>
                    value !== undefined && value !== null
                      ? Number(value).toFixed(2)
                      : '0.00'
                  }
                />
              </Form.Item>

              <Form.Item
                name='calculationUnit'
                rules={[
                  {
                    required: true,
                    message: `${t('PlsInput')} ${t('Unit')}`,
                  },
                ]}
              >
                <VSelect label={t('Unit')} required showSearch isHorizal>
                  {OpitionCalculationUnit.map((v) => (
                    <Option value={v.value} key={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>
            </div>

            <Form.Item name='note'>
              <VInput label={t('Note')} isHorizal />
            </Form.Item>
          </div>

          <div className='mt-4 flex justify-center'>
            <Button
              onClick={handleAddBooking}
              className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
            >
              {t('Create new goods')}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalBookingDetails;
