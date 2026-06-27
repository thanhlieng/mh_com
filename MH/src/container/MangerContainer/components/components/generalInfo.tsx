/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Divider,
  Form,
  FormInstance,
  Radio,
  RadioChangeEvent,
  Select,
  Table,
} from 'antd';
import moment from 'moment';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';
import VTimePicker from '@/components/common/VTimePicker';
import AddIcon from '@/components/Icon/AddIcon';
import InputCustome from '@/components/input/InputCustome';
import ItemControlTableRender from '@/components/TableCustom';

import { renderBookingDetails } from '@/contants/columns/my-booking.columns';
import {
  EServiceKey,
  FORMAT_DATE_DD_MM_YYYY,
} from '@/contants/common.constants';
import { BookingType, DetailsBookingPost } from '@/contants/types';
import useGetDeleveryId from '@/hook/getDeleveryId';
import {
  fetchCommoditiesTypeId,
  fetchServicesBooking,
  fetchShippingType,
  fetchTypeOfPayment,
} from '@/services/booking.services';

import ModalBookingDetails from './ModalBookingDeatails';
import ModalUpdateBookingDetails from './ModalUpdateBookingDetails';
const { Option } = Select;
interface GeneralInfomationProps {
  form: FormInstance;
  dataDetails: Array<DetailsBookingPost>;
  handleAddBookingDetails: (form: any) => void;
  handleDeleteRow: (id: any) => void;
  handleUpdateBookingDetails: (form: any) => void;
  serivcesSelected: string;
  handleServicesSelected: (e: any) => void;
  value: any;
  handleSetvalue: (e: any) => void;
  setIsEcommerceService: (e: any) => void;
  handleUpdateReferenceCode: (e: any) => void;
}

const GeneralInfomation = ({
  form,
  dataDetails,
  handleAddBookingDetails,
  handleDeleteRow,
  handleUpdateBookingDetails,
  handleServicesSelected,
  serivcesSelected,
  value,
  handleSetvalue,
  setIsEcommerceService,
  handleUpdateReferenceCode,
}: GeneralInfomationProps) => {
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [detailsBooking, setDetailsBooking] = useState();
  const { t } = useTranslation('booking');
  const { data: dataSerivicesBooknig } = useQuery(
    ['dataSerivicesBooknig', {}],
    () => fetchServicesBooking()
  );

  const { opitionDeliveryConditions } = useGetDeleveryId();

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
        key: v.key,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataSerivicesBooknig]);

  useEffect(() => {
    const serviceIDSelected = form.getFieldValue('serviceBookingId');
    if (!serviceIDSelected) return;

    const optionSelected = OpitionServiceBooking.find(
      (v: any) =>
        v.value === serviceIDSelected && v.key === EServiceKey.ECOMMERCE_SERVICE
    );
    if (optionSelected) {
      setIsEcommerceService(true);
      return;
    }
    setIsEcommerceService(false);
  });

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

  const { data: DataCommoditiesTypeId } = useQuery(
    ['DataCommoditiesTypeId', {}],
    () => fetchCommoditiesTypeId()
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

  const handleAddBooking = (form: any) => {
    handleAddBookingDetails(form);
    setIsCreate(false);
  };
  const onChange = (e: RadioChangeEvent) => {
    handleSetvalue(e.target.value);
  };

  const handleUpdateBooking = (record: any) => {
    setDetailsBooking(record);
    setIsEdit(true);
  };

  const handleServiceIsChanged = (value: any) => {
    handleServicesSelected(value);

    const optionSelected = OpitionServiceBooking.find(
      (v: any) => v.value === value && v.key === EServiceKey.ECOMMERCE_SERVICE
    );
    if (optionSelected) {
      setIsEcommerceService(true);
      return;
    }
    setIsEcommerceService(false);
  };

  return (
    <div className='h-full py-4 '>
      <Form form={form} className='gap-4'>
        <div className='grid grid-cols-2 gap-x-[50px]  xs:grid-cols-1'>
          <Form.Item
            name='serviceBookingId'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn loại dịch vụ',
              },
            ]}
          >
            <VSelect
              label={t('Service')}
              required
              isHorizal
              className='rounded-[10px]'
              onChange={handleServiceIsChanged}
            >
              {OpitionServiceBooking?.map((v: any) => (
                <Option key={v.value}>{v.label}</Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='deliveryConditionId'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn điều kiện giao hàng',
              },
            ]}
          >
            <VSelect label={t('Delivery Terms')} required isHorizal>
              {opitionDeliveryConditions?.map((v: any) => (
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
                message: 'Vui lòng chọn loại booking (Chứng từ, hàng hóa)',
              },
            ]}
          >
            <VSelect
              label={t('Booking Type (Documents, Goods)')}
              required
              isHorizal
            >
              {OpitionType.map((v) => (
                <Option key={v.value}>{v.label}</Option>
              ))}
            </VSelect>
          </Form.Item>

          <Form.Item
            name='estimatedDate'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn thời gian dự kiến lấy hàng',
              },
            ]}
          >
            <VDatePicker
              label={t('Expected Pickup Date')}
              format={FORMAT_DATE_DD_MM_YYYY}
              required
              isHorizal
              disabledDate={(current) => {
                // Can not select days before today and today
                return current && current < moment().startOf('day');
              }}
            />
            {/* <TimePicker format={HH_MM} /> */}
          </Form.Item>

          <div>
            <Form.Item
              name='estimateHour'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn thời gian dự kiến lấy hàng',
                },
              ]}
            >
              <VTimePicker
                format='HH:mm'
                label={t('Expected Pickup Time')}
                required
                isHorizal
                className='rounded-[10px]'
              />
            </Form.Item>

            <Form.Item
              name='typeOfPaymentId'
              className='py-4'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn loại thanh toán',
                },
              ]}
            >
              <VSelect label={t('Payment Type')} required isHorizal>
                {OpitionTypePayment?.map((v: any) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </VSelect>
            </Form.Item>
          </div>

          <div className=''>
            <Form.Item name='note'>
              <VTextArea label={t('Notes')} rows={6} isHorizal />
            </Form.Item>
            <Form.Item name='referenceCode'>
              <VInput
                isHorizal
                label={t('Reference Number')}
                onChange={(e) => handleUpdateReferenceCode(e.target.value)}
              />
            </Form.Item>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4'>
            <p className='m-0 p-0 '>{t('Customs declaration')}</p>
            <Radio.Group onChange={onChange} value={value}>
              <Radio value={1}>{t('No')}</Radio>
              <Radio value={2}>{t('Yes')}</Radio>
            </Radio.Group>
          </div>

          {value === 2 && (
            <div className='grid grid-cols-2 gap-x-6 xs:grid-cols-1'>
              <Form.Item
                name='isCustomerCreateDeclaration'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn loại mở tờ khai',
                  },
                ]}
              >
                <VSelect
                  label={t('Type of Opening Declaration')}
                  required
                  isHorizal
                >
                  <Option value={false}>
                    {t('MH GREAT SUN submits the customs declaration')}
                  </Option>
                  <Option value={true}>
                    {t('Customer submits the customs declaration')}
                  </Option>
                </VSelect>
              </Form.Item>
              <Form.Item
                name='customsDeclarationNumber'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số tờ khai hải quan',
                  },
                ]}
              >
                <VInput
                  label={t('Customs Declaration Number')}
                  required
                  isHorizal
                />
              </Form.Item>
            </div>
          )}
        </div>
        <Divider className='bg-[#D3D3D3]' />

        <Divider className='bg-[#D3D3D3]' />

        <div className='pb-6'>
          <p className='m-0 mb-[20px] p-0 '>{t('Booking Details')} </p>

          <div className='flex flex-row items-center justify-between gap-4 pb-6 xs:flex-col'>
            <div className='w-[350px] xs:w-full'>
              <InputCustome
                titleButton='Đăng kí'
                placeholder={t('Search Order')}
                suffix={
                  <Image
                    src='/images/search-icon.svg'
                    className='cursor-pointer'
                    width={38}
                    height={38}
                    alt='search'
                  />
                }
              />
            </div>

            <Button
              onClick={() => setIsCreate(true)}
              disabled={!serivcesSelected}
              className='h-8 rounded-md bg-none px-4 outline-none'
            >
              <div className='flex flex-row items-center justify-center gap-[6px]'>
                <AddIcon />
                <p className='m-0 p-0 text-[#1464a9]'>{t('Add Goods')}</p>
              </div>
            </Button>
          </div>

          <Table
            columns={renderBookingDetails(
              OpitionCommoditiesTypeId,
              OpitionShippingType,
              handleDeleteRow,
              handleUpdateBooking,
              t
            )}
            rowKey='key'
            scroll={{ y: 450, x: 500 }}
            className='cursor-pointer'
            dataSource={dataDetails}
            bordered
            pagination={{
              itemRender: ItemControlTableRender,
            }}
          />

          {isCreate && (
            <ModalBookingDetails
              isOpen={isCreate}
              services={serivcesSelected}
              listServices={OpitionServiceBooking}
              onClose={() => setIsCreate(false)}
              handleAddBookingDetails={handleAddBooking}
            />
          )}
          {isEdit && (
            <ModalUpdateBookingDetails
              isOpen={isEdit}
              services={serivcesSelected}
              listServices={OpitionServiceBooking}
              onClose={() => setIsEdit(false)}
              handleUpdateBookingDetails={(e) => {
                handleUpdateBookingDetails(e);
                setIsEdit(false);
              }}
              value={detailsBooking}
            />
          )}
        </div>
      </Form>
    </div>
  );
};

export default GeneralInfomation;
