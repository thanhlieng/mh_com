/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { WarningOutlined } from '@ant-design/icons';
import { Button, Form, Modal, notification, Spin, Table } from 'antd';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { teamplateInvoiceListColumns } from '@/contants/columns/list.columns';
import { QUERY_PARAMS } from '@/contants/common.constants';
import { IInvoiceDetails } from '@/contants/types';
import useInvoiceTeamplate from '@/hook/invoiceTeamplate';
import {
  deleteTeamplateInvoiceList,
  fetchCurrentUnit,
} from '@/services/booking.services';

import ModalInVoice from './ModalInvoice';

const InvoiceTeamplate = () => {
  const [openInvoice, setOpenInvoice] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [idRow, setIdRow] = useState<string | undefined>();
  const [detailsInvoice, setDetailsInvoice] = useState<Array<IInvoiceDetails>>(
    []
  );
  const [form] = Form.useForm();
  const { isLoading, data } = useInvoiceTeamplate();
  const queryClient = useQueryClient();
  const { mutate: deleteTeamplate } = useMutation(deleteTeamplateInvoiceList, {
    onSuccess: () => {
      queryClient.invalidateQueries(['templateInvoice']);
      notification.success({
        message: 'Xóa bài viết thành công',
        placement: 'top',
      });
      form.resetFields();
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Xóa bài viết thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { data: dataCurrenUnit } = useQuery(['fetchCurrentUnit2', {}], () =>
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
  const handleDeleteRow = (record: any) => {
    if (record.id) {
      Modal.confirm({
        title: 'Thông báo',
        icon: <WarningOutlined className='text-red-700' />,
        content: 'Bạn có chắc chắn muốn xóa nhân viên này không?',
        okText: 'Đồng ý',
        cancelText: 'Không',
        onOk: () => deleteTeamplate(record.id),
      });
    }
  };
  const handleUpdate = (record: any) => {
    if (record) {
      form.setFieldsValue({
        ...record,
        invoiceDate: moment(record.invoiceDate),
      });
      setDetailsInvoice(record.invoiceDetail);
      setIsUpdate(true);
      setIdRow(record.id);
    }
  };

  const handleAddInvoiceDetails = (resForm: any) => {
    setDetailsInvoice((prev) => [...prev, resForm]);
  };

  const handleUpdateBookingInvoice = (data: any) => {
    const res = detailsInvoice.map((x, index) => {
      if (data.idKey === index) {
        const { idKey, ...resetForm } = data;
        return resetForm;
      } else {
        return x;
      }
    });

    setDetailsInvoice(res);
  };
  const handleDeleteInvoice = (id: any) => {
    const res = detailsInvoice.filter((x, index) => id !== index);
    setDetailsInvoice(res);
  };
  return (
    <div>
      <Button
        type='primary'
        className='my-4'
        onClick={() => setOpenInvoice(true)}
      >
        Tạo mẫu invoice
      </Button>
      <Spin spinning={isLoading}>
        <Table
          className='mt-4'
          columns={teamplateInvoiceListColumns({
            optionCurrency: OpitionCurrencyUnit || [],
            handleDeleteRow,
            handleUpdate,
          })}
          pagination={{
            current: data?.pagination?.currentPage,
            total: data?.pagination?.totalCount,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          dataSource={data}
          bordered
          scroll={{ y: 450, x: 400 }}
        />
      </Spin>

      <ModalInVoice
        isOpen={openInvoice}
        isUpdate={isUpdate}
        onClose={() => {
          setOpenInvoice(false);
          setIsUpdate(false);
        }}
        form={form}
        idRow={idRow}
        detailsInvoice={detailsInvoice}
        handleAddInvoiceDetails={handleAddInvoiceDetails}
        handleUpdateBookingInvoice={handleUpdateBookingInvoice}
        handleDeleteInvoice={handleDeleteInvoice}
        setDetailsInvoice={setDetailsInvoice}
      />
    </div>
  );
};

export default InvoiceTeamplate;
