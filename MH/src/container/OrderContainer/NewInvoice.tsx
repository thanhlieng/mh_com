/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, FormInstance, Select, Table } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import VDatePicker from '@/components/common/VDatePicker';
import VInput from '@/components/common/VInput';
import VInputNumber from '@/components/common/VInputNumber';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';
import ItemControlTableRender from '@/components/TableCustom';

import { renderInvoiceDetails } from '@/contants/columns/my-booking.columns';
import {
  IInvoiceDetails,
  InvoiceItemType,
  InvoiceType,
  OpitionType,
} from '@/contants/types';
import useInvoiceTeamplate from '@/hook/invoiceTeamplate';
import {
  fetchCurrentUnit,
  fetchServicesBooking,
} from '@/services/booking.services';

import ModalInvoiceDetails from '../MangerContainer/components/components/ModalInvoiceDetails';
import ModalUpdateInvoiceDetails from '../MangerContainer/components/components/ModalUpdateInvoiceDetails';

type NewInvoice = {
  form: FormInstance;
  detailsInvoice: Array<IInvoiceDetails>;
  handleAddInvoiceDetails: (form: IInvoiceDetails) => void;
  handleUpdateBookingInvoice: (form: IInvoiceDetails) => void;
  handleDeleteInvoice: (id: any) => void;
  handleSetDetailsInvoice: (s: IInvoiceDetails[]) => void;
};

const { Option } = Select;
const NewInvoice = ({
  form,
  detailsInvoice,
  handleAddInvoiceDetails,
  handleUpdateBookingInvoice,
  handleDeleteInvoice,
  handleSetDetailsInvoice,
}: NewInvoice) => {
  const { data: dataCurrenUnit } = useQuery(['fetchCurrentUnit', {}], () =>
    fetchCurrentUnit()
  );
  const { t } = useTranslation('booking');
  const { data: dataTeamplateInvoice } = useInvoiceTeamplate();
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const handleUpdateInVoice = (record: any) => {
    handleSetDetailsInvoice(record);
    setIsEdit(true);
  };
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
  const opitionsTeamplate = useMemo(() => {
    if (dataTeamplateInvoice) {
      return dataTeamplateInvoice.map(
        ({ templateName, id }: { templateName: any; id: any }) => {
          return {
            label: templateName,
            value: id,
          };
        }
      ) as Array<OpitionType>;
    }
    return [] as never as Array<OpitionType>;
  }, [dataTeamplateInvoice]);

  const handleChangeValue = (e: any) => {
    const formValue = dataTeamplateInvoice.find((x: any) => x.id === e);
    form.setFieldsValue({
      ...formValue,
      invoiceDate: moment(),
    });
    handleSetDetailsInvoice(
      (formValue?.invoiceDetail as Array<IInvoiceDetails>) || []
    );
  };
  return (
    <div className='m-auto h-full'>
      <div className='m-auto mb-[18px] w-[1200px] rounded-md bg-pussy-color p-4 sm:w-full'>
        <VSelect
          label='Chọn mẫu Invoice'
          className='w-full'
          onChange={handleChangeValue}
        >
          {opitionsTeamplate.map((v) => (
            <Option key={v.value} value={v.value}>
              {v.label}
            </Option>
          ))}
        </VSelect>
      </div>

      <Form form={form}>
        <div className='m-auto mb-[18px] w-[1200px] rounded-md bg-pussy-color p-4 sm:w-full'>
          <p className='m-0 mb-[20px] p-0 text-xl font-bold'>Thông tin chung</p>
          <div className='grid grid-cols-2 gap-x-6 px-[86px] sm:grid-cols-1 sm:p-2'>
            <Form.Item
              name='typeItemInvoice'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn loại dịch vụ',
                },
              ]}
            >
              <VSelect label='Loại hàng hóa' required>
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
                  required: true,
                  message: 'Vui lòng chọn loại hóa đơn',
                },
              ]}
            >
              <VSelect label='Loại hóa đơn' required>
                {OpitionInvoiceType.map((v) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </VSelect>
            </Form.Item>
            <Form.Item name='senderInformation'>
              <VTextArea label='Thông tin người gửi' className='h-[130px]' />
            </Form.Item>
            <Form.Item name='receiverInformation'>
              <VTextArea label='Thông tin người nhận ' className='h-[130px]' />
            </Form.Item>
            <Form.Item
              name='invoiceDate'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập ngày invoice',
                },
              ]}
            >
              <VDatePicker
                format='DD/MM/YYYY'
                label='Ngày invoice'
                placeholder='Nhập ngày invoice'
                required
              />
            </Form.Item>
            <Form.Item
              name='serviceId'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng dịch vụ',
                },
              ]}
            >
              <VSelect label='Dịch vụ' required>
                {OpitionServiceBooking?.map((v: OpitionType) => (
                  <Option key={v.value} value={v.value}>
                    {v.label}
                  </Option>
                ))}
              </VSelect>
            </Form.Item>
          </div>

          <div className='px-[86px] sm:p-2'>
            <Form.Item name='importProceduresPerson'>
              <VTextArea label='Thông tin người làm thủ tục nhập khẩu' />
            </Form.Item>
          </div>

          <div className='grid grid-cols-5 gap-4 px-[86px] sm:grid-cols-2 sm:p-2'>
            <Form.Item name='invoiceNumber'>
              <VInput label='Số invoice' isHorizal />
            </Form.Item>

            <Form.Item name='totalNetWeight'>
              <VInputNumber label='Tổng trọng lượng thực (Kg)' isHorizal />
            </Form.Item>
            <Form.Item name='totalBulkyWeight'>
              <VInputNumber label='Tổng trọng lượng cồng kềnh' isHorizal />
            </Form.Item>
            <Form.Item name='goodsSize'>
              <VTextArea
                label='Kích thước hàng hóa (cm)'
                isHorizal
                placeholder='6x6x6 (1)'
              />
            </Form.Item>
            <Form.Item name='totalBaleNumber'>
              <VInputNumber label='Tổng số kiện' isHorizal />
            </Form.Item>
          </div>

          <div className=' grid grid-cols-2 gap-4 px-[86px] sm:p-2'>
            <Form.Item
              name='currencyId'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn loại tiền tệ',
                },
              ]}
            >
              <VSelect label='Loại tiền tệ' showSearch required isHorizal>
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
                  required: true,
                  message: 'Vui lòng nhập lý do xuất khẩu',
                },
              ]}
            >
              <VInput label='Lý do xuất khẩu' required isHorizal />
            </Form.Item>
          </div>
        </div>

        <div className='m-auto mb-[18px] w-[1200px] rounded-md bg-pussy-color p-4 sm:w-full'>
          <p className='m-0 mb-[20px] p-0 text-xl font-bold'>
            Chi tiết Invoice2
          </p>

          <div className='p-4'>
            <div className='flex flex-row  pb-6'>
              <Button
                onClick={() => setIsCreate(true)}
                className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'
              >
                Thêm Invoice
              </Button>
            </div>

            <Table
              columns={renderInvoiceDetails(
                handleDeleteInvoice,
                handleUpdateInVoice,
                t
              )}
              rowKey='key-HSCode-2'
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
                value={detailsInvoice}
                isInvoice={true}
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

export default NewInvoice;
