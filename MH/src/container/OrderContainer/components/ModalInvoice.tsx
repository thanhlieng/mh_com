/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, notification, Select, Table } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import VInputNumber from '@/components/common/VInputNumber';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';
import ItemControlTableRender from '@/components/TableCustom';
import ModalInvoiceDetails from '@/container/MangerContainer/components/components/ModalInvoiceDetails';
import ModalUpdateInvoiceDetails from '@/container/MangerContainer/components/components/ModalUpdateInvoiceDetails';

import { renderInvoiceDetails } from '@/contants/columns/my-booking.columns';
import {
  IInvoiceDetails,
  InvoiceItemType,
  InvoiceType,
  OpitionType,
} from '@/contants/types';
import {
  createTeamplateInvoice,
  fetchCurrentUnit,
  fetchServicesBooking,
  updateTeamplateInvoiceList,
} from '@/services/booking.services';
type ModalInVoiceProps = {
  isOpen: boolean;
  isUpdate: boolean;
  onClose: () => void;
  idRow?: string;
  form: FormInstance;
  detailsInvoice: Array<IInvoiceDetails>;
  handleAddInvoiceDetails: (form: IInvoiceDetails) => void;
  handleUpdateBookingInvoice: (form: IInvoiceDetails) => void;
  handleDeleteInvoice: (id: any) => void;
  setDetailsInvoice: (s: any) => void;
};
const { Option } = Select;

const ModalInVoice = ({
  isOpen,
  isUpdate,
  onClose,
  form,
  idRow,
  detailsInvoice,
  handleAddInvoiceDetails,
  handleUpdateBookingInvoice,
  handleDeleteInvoice,
  setDetailsInvoice,
}: ModalInVoiceProps) => {
  const { data: dataCurrenUnit } = useQuery(['fetchCurrentUnit', {}], () =>
    fetchCurrentUnit()
  );
  const { t } = useTranslation();
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const handleUpdateInVoice = (record: any) => {
    handleAddInvoiceDetails(record);
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
  const { mutate: createTeamplate } = useMutation(createTeamplateInvoice, {
    onSuccess: () => {
      queryClient.invalidateQueries(['templateInvoice']);
      notification.success({
        message: 'Tạo teamplate thành công',
        placement: 'top',
      });
      onClose();
      form.resetFields();
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Tạo teamplate thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: updateTeamplate } = useMutation(updateTeamplateInvoiceList, {
    onSuccess: () => {
      queryClient.invalidateQueries(['templateInvoice']);
      notification.success({
        message: 'Cập nhật teamplate thành công',
        placement: 'top',
      });
      onClose();
      form.resetFields();
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data
            ? e.response.data.message
            : 'Cập nhật teamplate thất bại'
        }`,
        placement: 'top',
      });
    },
  });

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

  const handleCreateTeamplate = async () => {
    const res = await form.validateFields();
    const dataPost = {
      ...res,
      invoiceDetail: detailsInvoice.map((v) => {
        const { totalMoney, ...res2 } = v;
        return {
          ...res2,
        };
      }),
    };
    if (isUpdate && idRow) {
      updateTeamplate({ id: idRow, data: dataPost });
    } else {
      createTeamplate({ data: dataPost });
    }
  };

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, []);
  return (
    <Modal
      footer={null}
      open={isOpen || isUpdate}
      title={
        <HeaderModal
          title={!isUpdate ? 'Tạo mới ' : 'Chỉnh sửa'}
          onClose={onClose}
        />
      }
      destroyOnClose
      closeIcon={false}
      closable={false}
      onCancel={onClose}
      className='top-[20px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <div className='m-auto h-full'>
        <Form form={form} className=''>
          <div className='m-auto mb-[18px] w-[1200px] rounded-md bg-pussy-color p-4 sm:w-full'>
            <p className='m-0 mb-[20px] p-0 text-xl font-bold'>
              Thông tin chung
            </p>
            <div className='grid grid-cols-1 gap-x-6 px-[86px] sm:grid-cols-1 sm:p-2'>
              <Form.Item
                name='templateName'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên mẫu invoice',
                  },
                ]}
              >
                <VInput label='Tên mẫu invoice' isHorizal required />
              </Form.Item>
            </div>
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
              <Form.Item name='invoiceNumber'>
                <VInput label='Số invoice' isHorizal />
              </Form.Item>
            </div>

            <div className='grid grid-cols-4 gap-4 px-[86px] sm:grid-cols-2 sm:p-2'>
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
              Chi tiết Invoice
            </p>

            <div className='p-4'>
              <div className='flex flex-row  pb-6'>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setIsCreate(true);
                  }}
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
              <ModalInvoiceDetails
                isOpen={isCreate}
                handleAddInvoiceDetails={handleAddInvoiceDetails}
                onClose={() => setIsCreate(false)}
              />

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

        <div className='my-4 flex gap-4 px-[86px] sm:p-2'>
          <Button type='primary' onClick={handleCreateTeamplate}>
            Lưu
          </Button>
          <Button type='primary' danger onClick={onClose}>
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalInVoice;
