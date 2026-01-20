/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect, useMemo } from 'react';
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
  handleUpdateBookingDetails: (form: any) => void;
  services?: string;
  listServices: Array<OpitionType>;
  value: any;
};

const { Option } = Select;

const ModalUpdateBookingDetails = ({
  isOpen,
  services,
  listServices,
  onClose,
  handleUpdateBookingDetails,
  value,
}: ModalBookingDetailsProps) => {
  const [detailsBookingForm] = Form.useForm();

  const { data: DataCommoditiesTypeId } = useQuery(
    ['DataCommoditiesTypeId', {}],
    () => fetchCommoditiesTypeId()
  );
  // const { data: DataShippingType } = useQuery(['DataShippingType', {}], () =>
  //   fetchShippingType()
  // );

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
      form: 'MH/src/container/MangerContainer/components/components/ModalUpdateBookingDetails.tsx',
    });

    detailsBookingForm.setFieldsValue({ bulkyWeight: bulkyWeightResult });

    const numb22 = bulkyWeightResult * quantity || 0;

    detailsBookingForm.setFieldsValue({ numb22: numb22.toFixed(2) });
  };

  const handleUpdateBooking = async () => {
    const resForm = await detailsBookingForm.validateFields();
    const updateForm = { ...resForm, idKey: value.idKey };
    handleUpdateBookingDetails(updateForm);
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

  // const OpitionShippingType = useMemo(() => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   //  @ts-ignore
  //   if (DataShippingType?.length < 0) {
  //     return [];
  //   } else {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     //  @ts-ignore
  //     return DataShippingType?.map((v) => ({
  //       value: v.id,
  //       label: v.name,
  //     }));
  //   }
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   //  @ts-ignore
  // }, [DataShippingType]);

  useEffect(() => {
    const fetchBulkyWeight = async () => {
      const width = value.width;
      const height = value.height;
      const longs = value.longs;
      const quantity = value.quantity;

      const bulkyWeightResult = await calculateBulkyWeight({
        serviceId: services,
        width: width,
        height: height,
        longs: longs,
        form: 'MH/src/container/MangerContainer/components/components/ModalUpdateBookingDetails.tsx',
      });

      const bulkyWeight = bulkyWeightResult || 0;
      detailsBookingForm.setFieldsValue({ bulkyWeight: bulkyWeight });

      const numb22 = bulkyWeight * quantity || 0;

      detailsBookingForm.setFieldsValue({
        ...value,
        numb22: numb22,
      });
    };

    fetchBulkyWeight();
  }, [detailsBookingForm, services, value]);

  return (
    <Modal
      footer={null}
      visible={isOpen}
      title={
        <HeaderModal
          title='Chỉnh sửa chi tiết đơn hàng trên từng kiện hàng'
          onClose={() => onClose(false)}
        />
      }
      destroyOnClose
      onCancel={() => onClose(false)}
      closable={false}
      className='top-[20px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <div>
        <p className='p-5 font-bold'>
          Note: Nếu các kiện hàng giống nhau về kích thước thì khai chung 1 kiện
          hàng - nếu các kiện hàng không giống nhau về kích thước thì khai từng
          kiện hàng
        </p>
        <Form form={detailsBookingForm}>
          <div className=' overflow-y-auto p-5'>
            <div className='grid grid-cols-2 gap-x-6 xs:grid-cols-1'>
              <Form.Item
                name='commoditiesTypeId'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập nhóm hàng hóa vận chuyển',
                  },
                ]}
              >
                <VSelect
                  label='Nhóm hàng hóa vận chuyển'
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
                    message: 'Vui lòng nhập mô tả cho hàng hóa',
                  },
                ]}
              >
                <VInput label='Mô tả chi tiết hàng hóa' required isHorizal />
              </Form.Item>

              <Form.Item
                name='shippingItemEn'
                className='w-full'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập nhóm hàng hóa vận chuyển',
                  },
                ]}
              >
                <VInput
                  label='Nhóm hàng hóa vận chuyển(Tiếng Anh)'
                  required
                  isHorizal
                />
              </Form.Item>

              <div className='grid grid-cols-2 gap-4'>
                <Form.Item
                  name='originItem'
                  className='w-full'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn xuất xứ hàng hóa',
                    },
                  ]}
                >
                  <VSelect
                    label='Xuất xứ hàng hóa'
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

                <Form.Item name='quantity'>
                  <VInputNumber
                    label='Số kiện'
                    required
                    isHorizal
                    onChange={handleChange}
                  />
                </Form.Item>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <Form.Item name='longs'>
                  <VInputNumber
                    label='Chiều dài (cm)'
                    onChange={handleChange}
                    required
                    isHorizal
                  />
                </Form.Item>

                <Form.Item name='width'>
                  <VInputNumber
                    label='Chiều rộng (cm)'
                    onChange={handleChange}
                    required
                    isHorizal
                  />
                </Form.Item>
                <Form.Item name='height'>
                  <VInputNumber
                    label='Chiều cao (cm)'
                    onChange={handleChange}
                    required
                    isHorizal
                  />
                </Form.Item>
              </div>
              <Form.Item name='weight'>
                <VInputNumber
                  label='Tổng trọng lượng thực (kg)'
                  required
                  isHorizal
                />
              </Form.Item>

              <Form.Item name='bulkyWeight'>
                <VInputNumber
                  label='Trọng lượng cồng kềnh (kg) tạm tính'
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
                  label='Tổng trọng lượng cồng kềnh (kg) tạm tính'
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
                    message: 'Vui lòng nhập đơn vị tính',
                  },
                ]}
              >
                <VSelect label='Đơn vị' required showSearch isHorizal>
                  {OpitionCalculationUnit.map((v) => (
                    <Option value={v.value} key={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>
            </div>
            <Form.Item name='note'>
              <VInput label='Ghi chú' isHorizal />
            </Form.Item>
          </div>

          <div className='mt-4 flex justify-end'>
            <Button
              type='primary'
              onClick={handleUpdateBooking}
              className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
            >
              Cập nhật Hàng hóa
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalUpdateBookingDetails;
