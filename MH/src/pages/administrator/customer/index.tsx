/* eslint-disable unused-imports/no-unused-vars */
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, notification, Spin, Table } from 'antd';
import { debounce } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { CUSTOMER_COLUMNS } from '@/contants/columns/customer-columns';
import { QueryParams } from '@/contants/common.constants';
import { QUERY_CUSTOMER } from '@/contants/query-key/customer.contants';
import { ICustomer } from '@/contants/types';
import useGetPermission from '@/hook/getPermission';
import AdminLayOut from '@/layout/AdminLayOut';
import { generateDowloadList } from '@/services/booking.services';
import { fetchCustomer } from '@/services/customer.services';

import ModalCreateCustomer from '../../../customer/components/ModalCustomer/CreateCustomer';
import ModalEditCustomer from '../../../customer/components/ModalCustomer/EditCustomer';

// import ModalCreateCustomer from './container/ModalCreateCustomer';
// import ModalEditCustomer from './container/ModalEditCustomer';
const QUERY_PARAMS: QueryParams = {
  page: 1,
  pageSize: 40,
  search: '',
};

const CustomerPage = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [customer, setCustomer] = useState<ICustomer>();
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isCreate, setCreate] = useState<boolean>(false);
  const { permissions } = useGetPermission();

  const {
    isLoading: isUserLoading,
    data: dataCustomer,
    isFetching: customerFetching,
  } = useQuery([QUERY_CUSTOMER.GET_CUSTOMER, { queries }], () =>
    fetchCustomer({ ...queries })
  );
  const handleClose = () => {
    setCreate(false);
  };
  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 0,
    }));
  };
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

  const handlePriceList = () => {
    getDowloadList({
      endpoint: 'customer/generate-excel-price-list',
    });
  };
  const handleListCustomer = () => {
    getDowloadList({
      endpoint: 'customer/generate-excel-customer',
    });
  };
  const handleListContact = () => {
    getDowloadList({
      endpoint: 'customer/generate-excel-contract',
    });
  };
  const handleListInfoCustomer = () => {
    getDowloadList({
      endpoint: 'customer/generate-excel-customer-detail',
    });
  };

  return (
    <div>
      <div className='gap-4'>
        <div className='flex flex-wrap gap-4 xs:mb-4'>
          <Input
            placeholder='Tìm kiếm...'
            prefix={<SearchOutlined />}
            className='mb-4 mr-4 w-[350px]'
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSearch(event.target.value)
            }
          />
          {permissions?.includes('create_customer') && (
            <Button type='primary' onClick={() => setCreate(true)}>
              Tạo mới khách hàng
            </Button>
          )}

          <Button
            type='primary'
            onClick={handlePriceList}
            icon={<DownloadOutlined />}
          >
            Danh sách bảng giá
          </Button>

          <Button
            type='primary'
            onClick={handleListCustomer}
            icon={<DownloadOutlined />}
          >
            Danh sách khách hàng
          </Button>

          <Button
            type='primary'
            onClick={handleListContact}
            icon={<DownloadOutlined />}
          >
            Danh sách hợp đồng
          </Button>

          <Button
            type='primary'
            onClick={handleListInfoCustomer}
            icon={<DownloadOutlined />}
          >
            Danh sách thông tin khách hàng
          </Button>
        </div>
        <Spin spinning={isUserLoading || customerFetching}>
          <Table
            columns={CUSTOMER_COLUMNS}
            className='cursor-pointer'
            dataSource={dataCustomer?.data}
            onChange={handlePagination}
            pagination={{
              current: dataCustomer?.pagination?.currentPage,
              total: dataCustomer?.pagination?.totalCount,
              showSizeChanger: false,
              defaultPageSize: QUERY_PARAMS.pageSize,
              itemRender: ItemControlTableRender,
            }}
            bordered
            onRow={(record) => {
              return {
                onClick: async () => {
                  if (
                    permissions?.includes('get_customer_detail') ||
                    permissions?.includes('get_all_list_customer')
                  ) {
                    await setCustomer(record);
                    await setIsOpenEdit(true);
                  }
                },
              };
            }}
            scroll={{ y: 700, x: 500 }}
          />
        </Spin>
        {isCreate && <ModalCreateCustomer onClose={handleClose} />}
        {isOpenEdit && (
          <ModalEditCustomer
            onClose={() => setIsOpenEdit(false)}
            value={customer}
          />
        )}
      </div>
    </div>
  );
};

CustomerPage.Layout = AdminLayOut;

export default CustomerPage;
