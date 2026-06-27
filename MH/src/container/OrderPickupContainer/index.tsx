/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Collapse,
  Form,
  Image,
  Input,
  notification,
  Spin,
  Table,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { debounce } from 'lodash';
import moment from 'moment';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { columnsAssignPickUp } from '@/contants/columns/columns-assign-pick-up';
import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import {
  confirmPickedUpService,
  GET_LIST_MY_ASSIGNED_BOOKING,
  getMyAssignedBooking,
} from '@/services/assign.services';

import OrderPickupItem from './OrderPickupItem';
const { Panel } = Collapse;

const OrderPickupContainer = () => {
  const [queriesAssign, setQueriesAssign] = useState<QueryParams>(QUERY_PARAMS);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bookingList, setBookingList] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [form] = useForm();
  const {
    data: dataAssign,
    isLoading: loadingAssign,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    [GET_LIST_MY_ASSIGNED_BOOKING, queriesAssign],
    () => getMyAssignedBooking({ ...queriesAssign }),
    {
      getNextPageParam: (lastPage: any) => {
        if (
          lastPage?.pagination?.currentPage < lastPage?.pagination?.totalPage
        ) {
          return lastPage?.pagination?.currentPage + 1;
        }
        return undefined;
      },
    }
  );

  const loadMoreData = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      setQueriesAssign({ ...queriesAssign, page: queriesAssign.page + 1 });
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { mutate: confirmPickedUp } = useMutation(confirmPickedUpService, {
    onSuccess: () => {
      queryClient.invalidateQueries(GET_LIST_MY_ASSIGNED_BOOKING);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
      form.resetFields();
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

  const handleSearch = debounce((value: string) => {
    setQueriesAssign((prev) => ({ ...prev, search: value }));
  }, 500);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const dataAssignPickUp = dataAssign?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    setBookingList([
      ...bookingList,
      ...(dataAssign?.pages.flatMap((page) => page.data) || []),
    ]);
  }, [dataAssign]);

  const handleSubmit = async () => {
    await form.validateFields();

    confirmPickedUp({
      bookingIds: selectedRowKeys as string[],
    });
    setSelectedRowKeys([]);
  };

  return (
    <Spin spinning={loadingAssign}>
      <Form form={form} className='grid grid-cols-2 xs:grid-cols-1 '>
        <div className='flex h-full w-full flex-col gap-[20px]'>
          <Input
            placeholder='Tìm kiếm đơn hàng ...'
            suffix={
              <Image
                src='/images/search-icon.svg'
                className='cursor-pointer'
                width={38}
                height={38}
                alt='search'
              />
            }
            className='mb-4 mr-4 w-full rounded-[10px] xs:mr-0'
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSearch(event.target.value)
            }
          />
        </div>
        <div className='mx-auto xs:mb-4'>
          <Button
            disabled={selectedRowKeys.length === 0}
            onClick={handleSubmit}
          >
            Xác nhận đã lấy hàng
          </Button>
        </div>
      </Form>
      <div className='hidden xs:block'>
        <InfiniteScroll
          dataLength={bookingList.length} // Total data loaded
          next={loadMoreData}
          hasMore={!!hasNextPage}
          loader={
            <h4 className='text-center'>
              <Spin spinning={isFetchingNextPage} />
            </h4>
          }
          endMessage={<p className='text-center'>Đã tải hết dữ liệu</p>}
        >
          <Collapse onChange={(v: any) => onSelectChange(v)}>
            {bookingList.map((v: any, index) => (
              <Panel
                header={
                  <div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {v.sender_other_shipping_address || v.sender_address}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {moment(v.estimate_date).format('HH:mm, DD/MM/YYYY')}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          textAlign: 'right',
                        }}
                      >
                        {v.sender_phone_number}
                      </div>
                    </div>
                  </div>
                }
                key={v.id}
              >
                <OrderPickupItem key={v.id} data={v} index={index} />
              </Panel>
            ))}
          </Collapse>
        </InfiniteScroll>
      </div>
      <Table
        rowKey={(record) => record.id}
        columns={columnsAssignPickUp}
        dataSource={dataAssignPickUp as Array<any>}
        rowSelection={rowSelection}
        className='xs:hidden'
        pagination={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //  @ts-ignore
          total: dataAssign?.pages[0]?.pagination?.totalCount,
          current: queriesAssign.page,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          onChange: (page) => {
            setQueriesAssign((prev) => ({ ...prev, page }));
          },
          itemRender: ItemControlTableRender,
        }}
      />
    </Spin>
  );
};

export default OrderPickupContainer;
