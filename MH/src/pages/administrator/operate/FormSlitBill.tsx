/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, notification, Table } from 'antd';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import ItemControlTableRender from '@/components/TableCustom';

import {
  calculateBulkyWeight,
  updateSplitBooking,
} from '@/services/booking.services';
import { renderColumsInfo } from '@/utils/contants/columns.contants';
import { QUERY_KEY } from '@/utils/contants/query-key';
const FormSplitBill = ({
  puDeliveryId,
  services,
}: {
  puDeliveryId: string;
  services: string;
}) => {
  const [dataTable, setDataTable] = useState<
    {
      partnerBookingBillCode: string;
      quantity: number;
      weight: number;
      bulkyWeight: number;
      height: number;
      width: number;
      longs: number;
    }[]
  >([]);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [idKey, setIdKey] = useState<string | undefined>(undefined);

  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: splitBooking } = useMutation(updateSplitBooking, {
    onSuccess: (resp: any) => {
      queryClient.invalidateQueries([QUERY_KEY.GET_DELIVERY]);
      notification.success({
        message: resp.message,
        placement: 'top',
      });
    },
    onError: (resp: any) => {
      notification.error({
        message: resp.response.data.message,
        placement: 'top',
      });
    },
  });

  const handleSubmit = () => {
    splitBooking({
      id: puDeliveryId,
      payload: {
        childrenBookings: dataTable,
      },
    });
  };

  const handleAddData = async () => {
    const res = await form.validateFields();

    const { width, height, longs } = res;

    const getBulkyWeight = async (id: string) => {
      const resp = await calculateBulkyWeight({
        serviceId: id,
        width,
        height,
        longs,
        form: 'MH/src/pages/administrator/operate/FormSlitBill.tsx',
      });

      return resp;
    };
    const bulkyWeight = await getBulkyWeight(services);
    if (idKey) {
      const resdata = dataTable.map((x, index) => {
        if (index.toString() === idKey.toString()) {
          return {
            ...res,
            bulkyWeight: bulkyWeight,
          };
        }
        return x;
      });

      setDataTable(resdata);
    } else {
      setDataTable([
        ...dataTable,
        {
          ...res,
          bulkyWeight: bulkyWeight,
        },
      ]);
    }

    handleClose();
  };
  const handleDeleteRow = (id: any) => {
    const res = dataTable.filter((x, index) => index !== id);
    setDataTable(res);
  };

  const handleUpdate = ({ data, idKey }: { data: any; idKey: any }) => {
    setIsUpdate(true);
    setIdKey(idKey);
    form.setFieldsValue(data);
  };

  const handleClose = () => {
    setOpenModal(false);
    setIsUpdate(false);
  };

  return (
    <div className='flex flex-col gap-4'>
      <Button
        onClick={() => setOpenModal(true)}
        type='primary'
        className='h-[38px] w-[150px] rounded-[10px]  border-0  text-[14px]  leading-[17px] outline-0'
      >
        Thêm bill
      </Button>
      <Table
        columns={renderColumsInfo({
          handleUpdate,
          handleDeleteRow,
        })}
        rowKey='key'
        className='cursor-pointer rounded-[10px]'
        dataSource={dataTable}
        pagination={{
          itemRender: ItemControlTableRender,
        }}
        bordered
        scroll={{ y: 650, x: 600 }}
      />
      <Modal
        footer={null}
        open={openModal || isUpdate}
        title={<HeaderModal title='Tách bill' onClose={handleClose} />}
        destroyOnClose
        closable={false}
        onCancel={handleClose}
        className='top-[calc(5vh)] w-[calc(70vw)] sm:top-0 sm:w-screen'
      >
        <Form form={form}>
          <div className='grid grid-cols-2 gap-4'>
            <Form.Item
              name='quantity'
              rules={[{ required: true, message: 'Vui lòng nhập trường này' }]}
            >
              <VInput label='Số kiện' isHorizal />
            </Form.Item>
            <Form.Item
              name='weight'
              rules={[{ required: true, message: 'Vui lòng nhập trường này' }]}
            >
              <VInput label='Cân nặng thực' isHorizal />
            </Form.Item>

            <Form.Item
              name='height'
              rules={[{ required: true, message: 'Vui lòng nhập trường này' }]}
            >
              <VInput label='Chiều cao' isHorizal />
            </Form.Item>
            <Form.Item
              name='width'
              rules={[{ required: true, message: 'Vui lòng nhập trường này' }]}
            >
              <VInput label='Chiều rộng' isHorizal />
            </Form.Item>
            <Form.Item
              name='longs'
              rules={[{ required: true, message: 'Vui lòng nhập trường này' }]}
            >
              <VInput label='Chiều dài' isHorizal />
            </Form.Item>
            <Form.Item
              name='partnerBookingBillCode'
              rules={[{ required: true, message: 'Vui lòng nhập trường này' }]}
            >
              <VInput label='Mã bill đối tác' isHorizal />
            </Form.Item>
          </div>

          <Button
            type='primary'
            onClick={handleAddData}
            className='h-[38px] w-[150px] rounded-[10px]   border-0  text-[14px]  leading-[17px]  outline-0'
          >
            Save
          </Button>
        </Form>
      </Modal>

      <Button
        type='primary'
        onClick={handleSubmit}
        className='h-[38px] w-[150px] rounded-[10px]   border-0  text-[14px]  leading-[17px]  outline-0'
      >
        Save
      </Button>
    </div>
  );
};

export default FormSplitBill;
