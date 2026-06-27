/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, notification, Select, Spin, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import VSelect from '@/components/common/VSelect';
import ItemControlTableRender from '@/components/TableCustom';

import { columnsAssignPickUp } from '@/contants/columns/columns-assign-pick-up';
import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import {
  assignBookingPickUp,
  GET_LIST,
  GET_LIST_BOOKING,
  getAssignBookingPickUp,
  getListEmployeeAssign,
} from '@/services/assign.services';

const { Option } = Select;
const AssignPickUpContainer = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [queriesAssign, setQueriesAssign] = useState<QueryParams>(QUERY_PARAMS);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const queryClient = useQueryClient();
  const [form] = useForm();

  const { data: dataListUser, isLoading: listUserLoading } = useQuery(
    [GET_LIST, queries],
    () => getListEmployeeAssign(queries)
  );

  const { data: dataAssign, isLoading: loadingAssign } = useQuery(
    [GET_LIST_BOOKING, queriesAssign],
    () => getAssignBookingPickUp(queriesAssign)
  );

  const { mutate: assignPickUp } = useMutation(assignBookingPickUp, {
    onSuccess: () => {
      queryClient.invalidateQueries([GET_LIST_BOOKING]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
      form.resetFields();
      setSelectedRowKeys([]);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const optionUser = useMemo(() => {
    if (!dataListUser) {
      return [];
    }
    return dataListUser?.map((v: any) => {
      return {
        value: v?.id,
        label: `${v.staffCode} - ${v?.fullName}`,
      };
    });
  }, [dataListUser]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const dataAssignPickUp = useMemo(() => {
    if (dataAssign || !loadingAssign) {
      return dataAssign?.data;
    }
    return [];
  }, [dataAssign, loadingAssign]);

  const handleSubmit = async () => {
    const res = await form.validateFields();

    assignPickUp({
      bookingIds: selectedRowKeys as string[],
      staffId: res.staffId,
    });
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueriesAssign((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };
  return (
    <Spin spinning={listUserLoading || loadingAssign}>
      <Form form={form} className='grid grid-cols-2  xs:grid-cols-1'>
        <Form.Item
          name='staffId'
          className='xs:hidden'
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn nhân viên',
            },
          ]}
        >
          <VSelect label='Chọn nhân viên' className='max-w-[400px]' showSearch>
            {optionUser.map((v) => (
              <Option key={v.value} value={v.value}>
                {v.label}
              </Option>
            ))}
          </VSelect>
        </Form.Item>

        <Form.Item
          name='staffId'
          className='hidden xs:block'
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn nhân viên',
            },
          ]}
        >
          <VSelect
            label='Chọn nhân viên'
            className='max-w-[400px] xs:max-w-full'
            isHorizal
          >
            {optionUser.map((v) => (
              <Option key={v.value} value={v.value}>
                {v.label}
              </Option>
            ))}
          </VSelect>
        </Form.Item>
        <div className='mx-auto'>
          <Button
            disabled={selectedRowKeys.length === 0}
            onClick={handleSubmit}
          >
            Phân phối đơn hàng
          </Button>
        </div>
      </Form>

      <Table
        rowKey={(record) => record.id}
        columns={columnsAssignPickUp}
        dataSource={dataAssignPickUp as Array<any>}
        rowSelection={rowSelection}
        onChange={handlePagination}
        pagination={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //  @ts-ignore
          current: dataAssign?.pagination?.currentPage,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //  @ts-ignore
          total: dataAssign?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
      />
    </Spin>
  );
};

export default AssignPickUpContainer;
