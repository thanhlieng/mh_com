/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Divider,
  Form,
  FormInstance,
  Image,
  Select,
  Table,
} from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VInputNumber from '@/components/common/VInputNumber';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';
import AddIcon from '@/components/Icon/AddIcon';
import InputCustome from '@/components/input/InputCustome';
import ItemControlTableRender from '@/components/TableCustom';

import { renderInvoiceDetails } from '@/contants/columns/my-booking.columns';
import {
  AddressCustomer,
  IInvoiceDetails,
  InvoiceItemType,
  InvoiceType,
  IUser,
  ReceiverCustome,
} from '@/contants/types';
import {
  fetchCurrentUnit,
  fetchServicesBooking,
} from '@/services/booking.services';

import ModalInvoiceDetails from './components/ModalInvoiceDetails';
import ModalUpdateInvoiceDetails from './components/ModalUpdateInvoiceDetails';

const { Option } = Select;

type InvoiceProps = {
  sendAddress?: Partial<AddressCustomer>;
  receiverCustome?: Partial<ReceiverCustome>;
  form: FormInstance;
  dataUser: IUser | undefined;
  detailsInvoice?: Array<IInvoiceDetails>;
  handleAddInvoiceDetails: (form: IInvoiceDetails) => void;
  handleUpdateBookingInvoice: (form: IInvoiceDetails) => void;
  handleDeleteInvoice: (id: any) => void;
  serivcesSelected: any;
  isInvoice: boolean;
};

const InVoice = ({
  form,
  dataUser,
  detailsInvoice,
  handleAddInvoiceDetails,
  handleDeleteInvoice,
  handleUpdateBookingInvoice,
  sendAddress,
  serivcesSelected,
  receiverCustome,
  isInvoice,
}: InvoiceProps) => {
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [detailsInvoices, setDetailsInvoices] = useState();
  const { t } = useTranslation('booking');
  const { data: dataCurrenUnit } = useQuery(['fetchCurrentUnit', {}], () =>
    fetchCurrentUnit()
  );
  const OpitionCurrencyUnit = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataCurrenUnit?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataCurrenUnit?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataCurrenUnit]);

  const { data: dataSerivicesBooknig } = useQuery(
    ['dataSerivicesBooknig', {}],
    () => fetchServicesBooking()
  );

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

  const OpitionInvoiceItemType = Object.entries(InvoiceItemType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  const OpitionInvoiceType = Object.entries(InvoiceType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const handleSetField = useCallback(async () => {
    form.setFieldsValue({
      senderInformation: `${sendAddress?.senderName || dataUser?.fullName}\n${
        sendAddress?.senderAddressEn ||
        `${sendAddress?.senderAddressEn1} ${sendAddress?.senderAddressEn2} ${sendAddress?.senderAddressEn3}` ||
        dataUser?.detailAddress
      }\n${sendAddress?.senderProvince || dataUser?.province}\n${
        sendAddress?.senderCountry || dataUser?.country
      }\n${sendAddress?.senderPhoneNumber || dataUser?.phoneNumber}\n${
        sendAddress?.senderPostalCode
      }`,
      receiverInformation: `${receiverCustome?.receiverName || ''}\n${
        receiverCustome?.receiverAddress ||
        `${receiverCustome?.receiverAddress1} ${receiverCustome?.receiverAddress2} ${receiverCustome?.receiverAddress3}`
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //  @ts-ignore
      }\n${receiverCustome?.receiverProvince || ''}\n${
        receiverCustome?.receiverCountry || ''
      }\n${receiverCustome?.receiverPhoneNumber || ''}\n${
        receiverCustome?.receiverPostalCode || ''
      }`,
      serviceId:
        OpitionServiceBooking?.filter(
          (x: any) => x.value === serivcesSelected
        )[0]?.label || undefined,
    });
  }, [
    form,
    sendAddress?.senderProvince,
    sendAddress?.senderCountry,
    sendAddress?.senderPhoneNumber,
    sendAddress?.senderPostalCode,
    dataUser?.fullName,
    dataUser?.detailAddress,
    dataUser?.province,
    dataUser?.country,
    dataUser?.phoneNumber,
    receiverCustome?.receiverName,
    receiverCustome?.receiverAddress,
    receiverCustome?.province,
    receiverCustome?.receiverCountry,
    receiverCustome?.receiverPhoneNumber,
    receiverCustome?.receiverPostalCode,
    OpitionServiceBooking,
    serivcesSelected,
  ]);

  useEffect(() => {
    handleSetField();
  }, [form, dataUser, handleSetField]);

  const handleUpdateInVoice = (record: any) => {
    setDetailsInvoices(record);
    setIsEdit(true);
  };
  return (
    <div className='m-auto h-full'>
      <Form form={form} className='px-[153px] xs:px-[15px] sm:px-[38px]'>
        <div className=''>
          <p className='m-0  p-0 text-sm leading-[17px]'>
            {t('General Information')}
          </p>
          <Divider />

          <div className='grid grid-cols-2 gap-x-6  xs:grid-cols-1 sm:p-2'>
            <Form.Item
              name='typeItemInvoice'
              rules={[
                {
                  required: isInvoice,
                  message: 'Vui lòng chọn loại dịch vụ',
                },
              ]}
            >
              <VSelect label={t('Type of goods')} required isHorizal>
                {OpitionInvoiceItemType.map((v) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </VSelect>
            </Form.Item>
            <Form.Item
              name='invoiceType'
              rules={[
                {
                  required: isInvoice,
                  message: 'Vui lòng chọn loại hóa đơn',
                },
              ]}
            >
              <VSelect label={t('Invoice type')} required isHorizal>
                {OpitionInvoiceType.map((v) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </VSelect>
            </Form.Item>
            <Form.Item name='senderInformation'>
              <VTextArea
                label={t('Sender information')}
                disabled
                rows={6}
                isHorizal
              />
            </Form.Item>
            <Form.Item name='receiverInformation'>
              <VTextArea
                label={t('Recipient information')}
                disabled
                rows={6}
                isHorizal
              />
            </Form.Item>
            <Form.Item name='invoiceDate'>
              <VDatePicker
                format='DD/MM/YYYY'
                label={t('Invoice date')}
                placeholder='Nhập ngày invoice'
                defaultValue={moment(new Date(), 'DD/MM/YYYY')}
                required
                isHorizal
              />
            </Form.Item>
            <Form.Item name='serviceId'>
              <VInput label={t('Service used')} disabled isHorizal />
            </Form.Item>
          </div>

          <div className='grid grid-cols-2 gap-4  xs:grid-cols-1 sm:p-2'>
            <Form.Item name='invoiceNumber'>
              <VInput label={t('Invoice number')} isHorizal />
            </Form.Item>

            <Form.Item name='totalNetWeight'>
              <VInputNumber
                label={t('Gross actual weight (Kg)')}
                disabled
                isHorizal
                formatter={(value) =>
                  value !== undefined && value !== null
                    ? Number(value).toFixed(2)
                    : '0.00'
                }
              />
            </Form.Item>
            <Form.Item name='totalBulkyWeight'>
              <VInputNumber
                label={t('Total bulky weight')}
                disabled
                isHorizal
                formatter={(value) =>
                  value !== undefined && value !== null
                    ? Number(value).toFixed(2)
                    : '0.00'
                }
              />
            </Form.Item>
            <Form.Item name='goodsSize'>
              <VInput label={t('Size of goods (cm)')} disabled isHorizal />
            </Form.Item>
            <Form.Item name='totalBaleNumber'>
              <VInputNumber
                label={t('Total number of packages')}
                disabled
                isHorizal
              />
            </Form.Item>

            <Form.Item
              name='currencyId'
              rules={[
                {
                  required: isInvoice,
                  message: 'Vui lòng chọn loại tiền tệ',
                },
              ]}
            >
              <VSelect label={t('Currency type')} showSearch required isHorizal>
                {OpitionCurrencyUnit?.map((v: any) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </VSelect>
            </Form.Item>
            <Form.Item
              name='reasonExport'
              rules={[
                {
                  required: isInvoice,
                  message: 'Vui lòng nhập lý do xuất khẩu',
                },
              ]}
            >
              <VInput label={t('Reason for export')} required isHorizal />
            </Form.Item>

            <Form.Item name='importProceduresPerson'>
              <VTextArea
                label={t('Import clearance person information')}
                isHorizal
                rows={6}
              />
            </Form.Item>
          </div>
        </div>
        <Divider />
        <div>
          <p className='m-0 p-0 text-[14px] leading-[17px]'>
            {t('Invoice details')}
          </p>

          <div>
            <div className='flex flex-row items-center justify-between gap-4 pb-6 xs:flex-col'>
              <div className='w-[350px] xs:w-full'>
                <InputCustome
                  titleButton='Đăng kí'
                  placeholder={t('Search order')}
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
                className='h-8 rounded-md bg-none px-4 outline-none'
              >
                <div className='flex flex-row items-center justify-center gap-[6px]'>
                  <AddIcon />
                  <p className='m-0 p-0 text-[#1464a9]'>{t('Add Invoice')}</p>
                </div>
              </Button>
            </div>

            <Table
              columns={renderInvoiceDetails(
                handleDeleteInvoice,
                handleUpdateInVoice,
                t
              )}
              rowKey='key-HSCode'
              className='cursor-pointer'
              dataSource={detailsInvoice}
              pagination={{
                showSizeChanger: false,
                itemRender: ItemControlTableRender,
              }}
              bordered
            />
            {isCreate && (
              <ModalInvoiceDetails
                isOpen={isCreate}
                handleAddInvoiceDetails={handleAddInvoiceDetails}
                onClose={() => setIsCreate(false)}
              />
            )}

            {isEdit && (
              <ModalUpdateInvoiceDetails
                isOpen={isEdit}
                value={detailsInvoices}
                isInvoice={isInvoice}
                onClose={() => setIsEdit(false)}
                handleEdiInvoiceDetails={(e) => {
                  handleUpdateBookingInvoice(e);
                  setIsEdit(false);
                }}
              />
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default InVoice;
