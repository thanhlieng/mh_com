/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Form,
  Input,
  InputNumber,
  notification,
  Select,
  Spin,
  Table,
} from 'antd';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_PARAMS } from '@/contants/common.constants';

import ItemControlTableRender from '@/components/TableCustom';
import {
  getOrderRemainingReport,
  updateOrderRemainingService,
} from '@/services/assign.services';
import {
  fetchServicePartnerService,
  generateDowloadList,
} from '@/services/booking.services';
import { DownloadOutlined } from '@ant-design/icons';
import { ORDER_REMAINING_REPORT_COLUMNS } from './columns';

const { Option } = Select;

const EditableContext = React.createContext(null);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//  @ts-ignore
const EditableRow = ({ _, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore  */}
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  editable,
  children,
  dataIndex,
  record,
  keyInput,
  handleSave,
  inputType = 'text', // Default là text
  ...restProps
}: any) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      const values = await form.validateFields();
      toggleEdit();

      const payload = { ...record, ...values };

      handleSave(payload);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      form.resetFields();
    } catch (errInfo) {
      notification.error({
        message: 'Có lỗi, vui lòng thử lại sau',
        placement: 'top',
      });
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item className='m-0 p-1' name={dataIndex}>
        {inputType === 'number' ? (
          <InputNumber
            className='w-full rounded-[10px]'
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        ) : (
          <Input
            className='w-full rounded-[10px]'
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        )}
      </Form.Item>
    ) : (
      <div className='editable-cell-value-wrap' onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};
const OrderRemainingReportContainer = () => {
  const [queriesGet, setQueriesGet] = useState<{
    ServiceID?: string;
    page: number;
    pageSize: number;
    search: string;
  }>({
    page: 1,
    pageSize: 20,
    search: '',
  });

  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { data: PartnerServices } = useQuery(
    ['fetchServicePartnerService'],
    () => fetchServicePartnerService()
  );

  const OpitionPartServices = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (PartnerServices?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return PartnerServices?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
  }, [PartnerServices]);

  const { data, isLoading } = useQuery(['GET_DATA', queriesGet], () =>
    getOrderRemainingReport(queriesGet)
  );

  const queryClient = useQueryClient();
  const { mutate: getDowloadList } = useMutation(generateDowloadList, {
    onSuccess: () => {
      queryClient.invalidateQueries([]);
      notification.success({
        message: 'Tải xuống thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Tải xuống thất bại',
        placement: 'top',
      });
    },
  });

  const { mutate: updateOrderRemaining } = useMutation(
    updateOrderRemainingService,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['GET_DATA']);
        notification.success({
          message: 'Cập nhật thành công',
          placement: 'top',
        });
      },
      onError: (e: any) => {
        notification.error({
          message: `${
            e.response.data ? e.response.data.message : 'Cập nhật thất bại'
          }`,
          placement: 'top',
        });
      },
    }
  );

  const exportPODReportFile = () => {
    getDowloadList({
      endpoint: 'connect-bill/export-order-remaining',
      params: queriesGet,
    });
  };

  const handleChangeService = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      ServiceID: value,
    }));
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueriesGet((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };

  const handleSave = (row: any) => {
    if (row.id) {
      updateOrderRemaining({
        id: row.id,
        data: {
          note: row.note,
        },
      });
    }
  };

  const columns = ORDER_REMAINING_REPORT_COLUMNS.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        };
      },
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-row flex-wrap gap-4'>
        <Select
          placeholder='Chọn dịch vụ'
          className='w-[250px]'
          onChange={handleChangeService}
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          showArrow
          showSearch
          allowClear
        >
          {OpitionPartServices?.map((v: any) => (
            <Option key={v.value} value={v.value}>
              {v.label}
            </Option>
          ))}
        </Select>

        <Spin spinning={exportLoading}>
          <Button
            type='primary'
            onClick={exportPODReportFile}
            icon={<DownloadOutlined />}
          >
            Xuất báo cáo
          </Button>
        </Spin>
      </div>

      <div>
        <Table
          components={components}
          dataSource={data?.data}
          columns={columns}
          rowKey={(e) => e.id}
          bordered
          onChange={handlePagination}
          scroll={{ y: 600, x: 600 }}
          rowClassName={() => 'editable-row'}
          pagination={{
            current: data?.pagination?.currentPage,
            total: data?.pagination?.totalCount,
            pageSize: data?.pagination?.pageSize,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default OrderRemainingReportContainer;
