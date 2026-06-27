/* eslint-disable @typescript-eslint/no-explicit-any */
import { Divider, Form, FormInstance, Radio, Select, Table } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';
import VTimePicker from '@/components/common/VTimePicker';
import ItemControlTableRender from '@/components/TableCustom';

import { renderBookingDetailsNoAction } from '@/contants/columns/my-booking.columns';
import { FORMAT_DATE_DD_MM_YYYY } from '@/contants/common.constants';
import { BookingType, DetailsBookingPost } from '@/contants/types';
import {
  fetchCommoditiesTypeId,
  fetchDeliveryCondition,
  fetchServicesBooking,
  fetchShippingType,
  fetchTypeOfPayment,
} from '@/services/booking.services';
const { Option } = Select;

const General = ({
  form,
  value,
  dataDetails,
}: {
  form: FormInstance;
  value: any;
  dataDetails: Array<DetailsBookingPost>;
}) => {
  const { data: dataSerivicesBooknig } = useQuery(
    ['dataSerivicesBooknig', {}],
    () => fetchServicesBooking()
  );
  const { data: DataCommoditiesTypeId } = useQuery(
    ['DataCommoditiesTypeId', {}],
    () => fetchCommoditiesTypeId()
  );

  const { t } = useTranslation('booking');

  const { data: DataShippingType } = useQuery(['DataShippingType', {}], () =>
    fetchShippingType()
  );

  const OpitionShippingType = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (DataShippingType?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return DataShippingType?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
  }, [DataShippingType]);

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

  const OpitionServiceBooking = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataSerivicesBooknig?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataSerivicesBooknig?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataSerivicesBooknig]);

  const { data: dataDelivery } = useQuery(['fetchDeliveryCondition', {}], () =>
    fetchDeliveryCondition()
  );

  const OpitionDeliveryConditions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataDelivery?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataDelivery?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataDelivery]);

  const OpitionType = Object.entries(BookingType).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const { data: fetchTypeOfPaymentId } = useQuery(
    ['fetchTypeOfPaymentId', {}],
    () => fetchTypeOfPayment()
  );

  const OpitionTypePayment = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (fetchTypeOfPaymentId?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return fetchTypeOfPaymentId?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [fetchTypeOfPaymentId]);

  return (
    <div className='mb-20 h-full'>
      <Form form={form}>
        <p className='m-0 p-0 font-bold'>1.Thông tin chung </p>
        <Divider className='bg-yellow' />
        <div className='grid grid-cols-2 gap-x-6'>
          <Form.Item
            name='serviceBookingId'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn loại dịch vụ',
              },
            ]}
          >
            <VSelect label={t('Service')} required disabled isHorizal>
              {OpitionServiceBooking?.map((v: any) => (
                <Option key={v.value}>{v.label}</Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item name='deliveryConditionId'>
            <VSelect label={t('Delivery Terms')} required disabled isHorizal>
              {OpitionDeliveryConditions?.map((v: any) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item name='type'>
            <VSelect
              label={t('Booking Type (Documents, Goods)')}
              required
              disabled
              isHorizal
            >
              {OpitionType.map((v) => (
                <Option key={v.value}>{v.label}</Option>
              ))}
            </VSelect>
          </Form.Item>

          <div className='grid grid-cols-2 gap-x-6'>
            <Form.Item name='estimatedDate'>
              <VDatePicker
                label={t('Expected Pickup Date')}
                format={FORMAT_DATE_DD_MM_YYYY}
                required
                disabled
                isHorizal
              />
            </Form.Item>

            <Form.Item name='estimateHour'>
              <VTimePicker
                format='HH:mm'
                label={t('Expected Pickup Time')}
                required
                disabled
                isHorizal
              />
            </Form.Item>
          </div>

          <Form.Item name='note'>
            <VInput label='Note' disabled isHorizal />
          </Form.Item>
        </div>

        <p className='m-0 p-0 font-bold'>2.Hình thức thanh toán </p>
        <Divider className='bg-yellow' />

        <div className='grid grid-cols-2 gap-x-6'>
          <Form.Item name='typeOfPaymentId'>
            <VSelect label={t('Payment Type')} required disabled isHorizal>
              {OpitionTypePayment?.map((v: any) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
          {/* Chi Tiết booking */}
        </div>
        <p className='m-0 p-0 font-bold'>3.Tờ khai hải quan</p>
        <div className='flex flex-col gap-4'>
          <Radio.Group value={value} disabled>
            <Radio value={1}>Không</Radio>
            <Radio value={2}>Có</Radio>
          </Radio.Group>
          {value === 2 && (
            <div className='grid grid-cols-2 gap-x-6'>
              <Form.Item name='isCustomerCreateDeclaration'>
                <VSelect
                  label={t('Type of Opening Declaration')}
                  required
                  disabled
                  isHorizal
                >
                  <Option value={false}>
                    MH GREAT SUN mở tờ khai hải quan
                  </Option>
                  <Option value={true}>Khách hàng mở tờ khai hải quan</Option>
                </VSelect>
              </Form.Item>
              <Form.Item name='customsDeclarationNumber'>
                <VInput
                  label={t('Customs Declaration Number')}
                  required
                  disabled
                />
              </Form.Item>
            </div>
          )}
        </div>
        <Divider className='bg-yellow' />

        <p className='m-0 p-0 font-bold'>4.{t('Booking Details')} </p>
        <Divider className='bg-yellow' />

        <div>
          <Table
            columns={renderBookingDetailsNoAction(
              OpitionCommoditiesTypeId,
              OpitionShippingType,
              t
            )}
            rowKey='key'
            scroll={{ y: 450, x: 500 }}
            className='cursor-pointer'
            dataSource={dataDetails}
            pagination={{
              showSizeChanger: false,
              itemRender: ItemControlTableRender,
            }}
            bordered
          />
        </div>
      </Form>
    </div>
  );
};
export default General;
