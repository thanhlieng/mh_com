/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, notification, Spin, Table } from 'antd';
import { debounce } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { renderColumnsEmployee } from '@/contants/columns/employee-colums';
import { QueryParams } from '@/contants/common.constants';
import { QUERY_EMPLOYEE } from '@/contants/query-key/employee.contants';
import { IStaff } from '@/contants/types';
import useGetPermission from '@/hook/getPermission';
import AdminLayOut from '@/layout/AdminLayOut';
import { getUnit } from '@/services/customer.services';
import { fetchUsers } from '@/services/employee.services';

import { generateDowloadList } from '@/services/booking.services';
import ModalCreateEmployee from './components/ModalCreateEmployee';
import ModalEditEmployee from './components/ModalEditEmployee';
type MergedParams = QueryParams & {
  status?: 'ACTIVE' | 'INACTIVE' | undefined;
};

const QUERY_PARAMS: MergedParams = {
  page: 1,
  pageSize: 40,
  search: '',
};
const EmployeeContainer = () => {
  const [queries, setQueries] = useState<MergedParams>(QUERY_PARAMS);
  const [employee, setSlectEmployee] = useState<IStaff>();
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isCreateEmployee, setCreateEmployee] = useState<boolean>(false);
  const { permissions } = useGetPermission();
  const {
    isLoading: isUserLoading,
    data: dataUser,
    isFetching: userFetching,
  } = useQuery([QUERY_EMPLOYEE.GET_EMPLOYEE, queries], () =>
    fetchUsers({ ...queries })
  );

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);
  const handleSetStatus = debounce((value: any) => {
    setQueries((prev) => ({ ...prev, status: value }));
  }, 500);

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 0,
    }));
  };
  const { data: dataUnits } = useQuery(['getUnit', {}], () => getUnit());

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

  const handleExportStaff = () => {
    getDowloadList({
      endpoint: 'staffs/export-staffs',
      params: queries,
    });
  };

  return (
    <div className='gap-4'>
      <div className='flex flex-row flex-wrap gap-4'>
        <Input
          placeholder='Tìm kiếm...'
          prefix={<SearchOutlined />}
          className='mb-4 mr-4 w-[350px]'
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleSearch(event.target.value)
          }
        />
        <div className='flex flex-row flex-wrap gap-4'>
          {permissions?.includes('create_staff') && (
            <Button onClick={() => setCreateEmployee(true)} type='primary'>
              Tạo mới nhân viên
            </Button>
          )}

          <Button
            type='primary'
            onClick={handleExportStaff}
            icon={<DownloadOutlined />}
          >
            Danh sách nhân viên
          </Button>

          <Button
            type='primary'
            danger
            onClick={() => handleSetStatus('inactive')}
          >
            Nhân sự đã nghỉ việc
          </Button>
          <Button type='primary' onClick={() => handleSetStatus('active')}>
            Nhân sự đang hoạt động
          </Button>
          <Button type='primary' onClick={() => handleSetStatus(undefined)}>
            Toàn bộ nhân sự
          </Button>
        </div>
      </div>
      <Spin spinning={isUserLoading || userFetching}>
        <Table
          columns={renderColumnsEmployee({
            pageSize: dataUser?.pagination?.currentPage,
            dataUnits: dataUnits,
          })}
          className='cursor-pointer'
          dataSource={dataUser?.data}
          onChange={handlePagination}
          pagination={{
            current: dataUser?.pagination?.currentPage,
            total: dataUser?.pagination?.totalCount,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          bordered
          onRow={(record) => {
            return {
              onClick: async () => {
                if (permissions?.includes('get_staff_detail')) {
                  await setSlectEmployee(record);
                  await setIsOpenEdit(true);
                }
              },
            };
          }}
          scroll={{ y: 700, x: 500 }}
        />
      </Spin>

      {isCreateEmployee && <ModalCreateEmployee onClose={setCreateEmployee} />}

      {isOpenEdit && (
        <ModalEditEmployee value={employee} onClose={setIsOpenEdit} />
      )}
    </div>
  );
};
EmployeeContainer.Layout = AdminLayOut;

export default EmployeeContainer;
