/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, notification, Select, Spin, Table } from 'antd';
import { debounce } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import {
  checkPointACFColumns,
  checkPointMAWBColumns,
} from '@/contants/columns/check-point-columns';
import { QueryParams } from '@/contants/common.constants';
import { QUERY_EMPLOYEE } from '@/contants/query-key/employee.contants';
import { countries } from '@/contants/types/Country';
import AdminLayOut from '@/layout/AdminLayOut';
import {
  creatCheckPoint,
  creatCheckPointMWA,
  deleteCheckPoint,
  getCheckpointByBillCode,
  getCheckpointByBillCodeMWA,
  updateCheckPoint,
} from '@/services/employee.services';

import CreateCheckPoint from './components/CreateCheckPoint';

const QUERY_PARAMS: QueryParams = {
  page: 1,
  pageSize: 40,
  search: '',
};

const { Option } = Select;
const CheckPointPage = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [idCheckPoint, setIdCheckPoint] = useState();
  const [select, setSelect] = useState('ACF');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const {
    isLoading: billCodeLoading,
    data: dataBillCode,
    isFetching: billCodeFetching,
  } = useQuery([QUERY_EMPLOYEE.GET_EMPLOYEE, queries, select], () =>
    select === 'ACF'
      ? getCheckpointByBillCode({ billCode: queries.search })
      : getCheckpointByBillCodeMWA({ billCode: queries.search })
  );

  const { mutate: mutateCreate } = useMutation(creatCheckPoint, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_EMPLOYEE.GET_EMPLOYEE]);
      notification.success({
        message: 'Tạo đơn hàng mới thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Vui lòng kiểm tra lại các trường còn thiếu',
        placement: 'top',
      });
    },
  });

  const { mutate: mutateMWA } = useMutation(creatCheckPointMWA, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_EMPLOYEE.GET_EMPLOYEE]);
      notification.success({
        message: 'Tạo đơn hàng mới thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Vui lòng kiểm tra lại các trường còn thiếu',
        placement: 'top',
      });
    },
  });
  const { mutate: mutateDelete } = useMutation(deleteCheckPoint, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_EMPLOYEE.GET_EMPLOYEE]);
      notification.success({
        message: 'Tạo đơn hàng mới thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Vui lòng kiểm tra lại các trường còn thiếu',
        placement: 'top',
      });
    },
  });

  const { mutate: mutateUpdate } = useMutation(updateCheckPoint, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_EMPLOYEE.GET_EMPLOYEE]);
      notification.success({
        message: 'Tạo đơn hàng mới thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Vui lòng kiểm tra lại các trường còn thiếu',
        placement: 'top',
      });
    },
  });

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const onSubmit = async () => {
    const res = await form.validateFields();
    const newRes = {
      ...res,
      countryName: countries.find((x) => x.value === res.countryIso3)?.label,
    };

    if (select === 'ACF') {
      if (dataBillCode?.id) {
        mutateCreate({ id: dataBillCode.id, data: newRes });
        setIsOpenModal(false);
        form.resetFields();
      }
    } else {
      mutateMWA({ data: newRes, checkpointIds: selectedRowKeys as string[] });
    }
  };
  const handleDelete = (id: string) => {
    mutateDelete(id);
  };

  const handleAddClose = () => {
    setIsOpenModal(false);
    form.resetFields();
  };

  const handleEditClose = () => {
    setIsOpenModal(false);
    setIsEditItem(false);
    form.resetFields();
    setIdCheckPoint(undefined);
  };
  const handleUpdate = (row: any) => {
    form.setFieldsValue({
      ...row,
      checkpointTime: moment(row?.checkpointTime || undefined),
    });
    setIsOpenModal(true);
    setIsEditItem(true);
    setIdCheckPoint(row.id);
  };

  const updateCheckPointConfirm = async () => {
    if (idCheckPoint) {
      const res = await form.validateFields();
      const timezone = res['timezone'];
      const checkpointTime = moment(res['checkpointTime'])
        .tz(timezone)
        .format();

      const newRes = {
        ...res,
        checkpointTime,
        countryName: countries.find((x) => x.value === res.countryIso3)?.label,
      };
      mutateUpdate({ id: idCheckPoint, data: newRes });
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;
  return (
    <div>
      <div className='gap-4'>
        <div className=' flex flex-row flex-wrap gap-4'>
          <div>
            <Select
              className='w-[200px]'
              defaultValue={select}
              onChange={(e) => setSelect(e)}
            >
              <Option value='ACF'>Tạo theo mã MH</Option>
              <Option value='MAWB'>Tạo theo mã MAWB</Option>
            </Select>
            <Input
              placeholder='Tìm kiếm đơn hàng... '
              prefix={<SearchOutlined />}
              className='mb-4 mr-4 w-[350px]'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleSearch(event.target.value)
              }
            />
          </div>

          {select === 'ACF' ? (
            <Button
              type='primary'
              onClick={() => setIsOpenModal(true)}
              disabled={!dataBillCode?.id}
            >
              Thêm check point
            </Button>
          ) : (
            <Button
              type='primary'
              onClick={() => setIsOpenModal(true)}
              disabled={!hasSelected}
            >
              Thêm check point
            </Button>
          )}
        </div>
        <Spin spinning={billCodeFetching || billCodeLoading}>
          <Table
            columns={
              select === 'ACF'
                ? checkPointACFColumns({
                    handleDelete,
                    handleUpdate,
                  })
                : checkPointMAWBColumns({
                    handleDelete,
                    handleUpdate,
                  })
            }
            className='cursor-pointer'
            dataSource={
              select === 'ACF' ? dataBillCode?.checkpoints : dataBillCode
            }
            bordered
            rowKey={(record) => record.id}
            scroll={{ y: 700, x: 500 }}
            rowSelection={rowSelection}
          />
        </Spin>

        {isOpenModal && (
          <CreateCheckPoint
            onClose={isEditItem ? handleEditClose : handleAddClose}
            form={form}
            isEdit={isEditItem}
            onSubmit={isEditItem ? updateCheckPointConfirm : onSubmit}
          />
        )}
      </div>
    </div>
  );
};

CheckPointPage.Layout = AdminLayOut;

export default CheckPointPage;
