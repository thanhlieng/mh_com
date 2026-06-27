/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoadingOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Divider,
  Input,
  notification,
  Spin,
  Table,
} from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import moment from 'moment';
import { ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ExcelIcon from '@/components/Icon/ExcelIcon';
import ItemControlTableRender from '@/components/TableCustom';

import { renderMyBooking } from '@/contants/columns/my-booking.columns';
import { QueryParams3 } from '@/contants/common.constants';
import { QUERY_BOOKING } from '@/contants/query-key/booking.query';
import { BookingStatusPost } from '@/contants/types';
import { withPrivateRouteUser } from '@/routes/withPrivateRouteUser';
import {
  fetchBooking,
  generateExcelMyBooking,
} from '@/services/booking.services';

import ModalViewBooking from './components/ModalViewBooking';

const QUERY_PARAMS: QueryParams3 = {
  page: 1,
  pageSize: 20,
  search: '',
  status: undefined,
  createBookingFrom: undefined,
  createBookingTo: undefined,
};

// const { RangePicker } = DatePicker;

const ManageContainer = () => {
  const [queries, setQueries] = useState<QueryParams3>(QUERY_PARAMS);
  const [idBooking, setIdbooking] = useState();
  const [isViewBooking, setIsViewBooking] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation('booking');
  const { mutate: generateExcel, isLoading: generateExcelLoading } =
    useMutation(generateExcelMyBooking, {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
        notification.success({
          message: t('Download successful'),
          placement: 'top',
        });
      },
      onError: () => {
        notification.error({ message: t('Download failed'), placement: 'top' });
      },
    });

  const { data, isLoading, isFetching } = useQuery(
    [QUERY_BOOKING.GET_BOOKING, queries],
    () => fetchBooking({ ...queries })
  );

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const dataTable = useMemo(() => {
    return data?.data?.map((v, k) => ({
      ...v,
      key: k,
    }));
  }, [data?.data]);

  const handleSetStatus = debounce((value: BookingStatusPost) => {
    setQueries((prev) => ({ ...prev, status: value }));
  }, 500);

  const handleFilterDate = (name: string, value: any) => {
    setQueries((prev) => ({
      ...prev,
      [name]: value ? dayjs(value).format('YYYY-MM-DD') : undefined,
    }));
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current,
    }));
  };

  const handleGenerateExcelBooking = () => {
    generateExcel({
      createBookingFrom: queries.createBookingFrom,
      createBookingTo: queries.createBookingTo,
    });
  };

  const handleRemoveFilter = () => {
    setQueries(QUERY_PARAMS);
  };

  return (
    <div>
      <div className='mt-[50px] flex items-center justify-center gap-[10px]'>
        <Image src='/images/box.svg' width={40} height={40} alt='' />
        <p className='m-0 p-0 text-[18px] font-medium uppercase leading-[22px]'>
          {t('BookingManager')}
        </p>
      </div>
      <div className='mb-[86px] flex flex-row gap-[38px] px-[38px] py-4 xs:flex-col xs:px-[15px]'>
        <div className='w-[216px] xs:hidden'>
          <div className='flex h-full w-full flex-col gap-[20px]'>
            <Input
              placeholder={t('Search order')}
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
            <div className='flex h-[45px] items-center border-y-[1px] border-l-[5px] border-l-[#41BF80] pl-[12px] text-[14px] leading-[17px]'>
              {t('Order status')}
            </div>
            <div className='flex flex-col gap-[12px]  '>
              <Button
                className='h-[38px] w-full border-0 bg-[#F8F8F8]'
                onClick={() =>
                  handleSetStatus(BookingStatusPost.NOT_YET_HANDED_OVER)
                }
              >
                {t('Unconfirmed')}
              </Button>
              <Button
                className='h-[38px] w-full border-0 bg-[#F8F8F8]'
                onClick={() => handleSetStatus(BookingStatusPost.HANDED_OVER)}
              >
                {t('Confirmed')}
              </Button>
              <Button
                className='h-[38px] w-full border-0 bg-[#F8F8F8]'
                onClick={() => handleSetStatus(BookingStatusPost.DONE)}
              >
                {t('Picked up')}
              </Button>
              <Button
                className='h-[38px] w-full border-0 bg-[#F8F8F8]'
                onClick={() =>
                  handleSetStatus(BookingStatusPost.NOT_DELIVERED_YET)
                }
              >
                {t('Not delivered')}
              </Button>
              <Button
                className='h-[38px] w-full border-0 bg-[#F8F8F8]'
                onClick={() => handleSetStatus(BookingStatusPost.DELIVERED)}
              >
                {t('Delivered')}
              </Button>
              <Button
                className='h-[38px] w-full border-0 bg-[#F8F8F8]'
                onClick={() => handleSetStatus(BookingStatusPost.CANCEL)}
              >
                {t('Cancelled')}
              </Button>
            </div>

            <div className='flex h-[45px] items-center border-y-[1px] border-l-[5px] border-l-[#C579DC] pl-[12px] text-[14px] leading-[17px]'>
              {t('Booking creation time')}
            </div>
            <div className='flex flex-col items-center gap-2 pb-4'>
              <div className='w-full text-left text-[14px] leading-[17px]'>
                {t('From Date')}
              </div>
              <DatePicker
                format='DD-MM-YYYY'
                className='h-[38px] w-full rounded-[10px]'
                placeholder={t('Select Date')}
                value={
                  queries.createBookingFrom
                    ? moment(queries.createBookingFrom)
                    : null
                }
                onChange={(e) => handleFilterDate('createBookingFrom', e)}
              />
              <div className='w-full text-left text-[14px] leading-[17px]'>
                {t('To Date')}
              </div>
              <DatePicker
                format='DD-MM-YYYY'
                className='h-[38px] w-full rounded-[10px]'
                placeholder={t('Select Date')}
                value={
                  queries.createBookingTo
                    ? moment(queries.createBookingTo)
                    : null
                }
                onChange={(e) => handleFilterDate('createBookingTo', e)}
              />
              <div className='w-full text-left'>
                <div className='w-full text-left'>
                  <Button
                    className='border-1 mt-2 h-[38px] w-full bg-[#E8F8F8]'
                    onClick={handleRemoveFilter}
                  >
                    {t('Remove the filter')}
                  </Button>
                </div>
                <Divider className='border-[#D3D3D3]' />
                {!generateExcelLoading ? (
                  <div
                    className='mb-4 flex cursor-pointer flex-row items-center gap-2'
                    onClick={handleGenerateExcelBooking}
                  >
                    <ExcelIcon />
                    <span>{t('Export Excel')}</span>
                  </div>
                ) : (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}

        <div className='hidden gap-[20px] xs:grid'>
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
          <div className='flex h-[45px] items-center border-y-[1px] border-l-[5px] border-l-[#41BF80] pl-[12px] text-[14px] leading-[17px]'>
            {t('Order status')}
          </div>

          <div className='grid grid-cols-2 gap-4 '>
            <Button
              className='h-[38px] w-full border-0 bg-[#F8F8F8]'
              onClick={() =>
                handleSetStatus(BookingStatusPost.NOT_YET_HANDED_OVER)
              }
            >
              Chưa xác nhận
            </Button>
            <Button
              className='h-[38px] w-full border-0 bg-[#F8F8F8]'
              onClick={() => handleSetStatus(BookingStatusPost.HANDED_OVER)}
            >
              Đã xác nhận
            </Button>
            <Button
              className='h-[38px] w-full border-0 bg-[#F8F8F8]'
              onClick={() => handleSetStatus(BookingStatusPost.DONE)}
            >
              Đã lấy hàng
            </Button>
            <Button
              className='h-[38px] w-full border-0 bg-[#F8F8F8]'
              onClick={() => handleSetStatus(BookingStatusPost.CANCEL)}
            >
              Đã hủy
            </Button>
          </div>
          <div className='flex h-[45px] items-center border-y-[1px] border-l-[5px] border-l-[#C579DC] pl-[12px] text-[14px] leading-[17px]'>
            Thời gian tạo booking
          </div>
          <div className='hidden grid-cols-1 items-center gap-4 p-4 xs:grid'>
            <div>
              <div>Từ ngày</div>
              <DatePicker
                format='DD-MM-YYYY'
                className='h-[38px] w-full rounded-[10px]'
                placeholder='Chọn ngày'
                onChange={(e) => handleFilterDate('createBookingFrom', e)}
              />
            </div>
            <div>
              <div>Đến ngày</div>
              <DatePicker
                format='DD-MM-YYYY'
                className='h-[38px] w-full rounded-[10px]'
                placeholder='Chọn ngày'
                onChange={(e) => handleFilterDate('createBookingTo', e)}
              />
            </div>
          </div>
          <div className='w-full text-center'>
            <Divider className='border-[#D3D3D3]' />
            {!generateExcelLoading ? (
              <div
                className='mb-4 flex cursor-pointer flex-row items-center justify-center gap-2'
                onClick={handleGenerateExcelBooking}
              >
                <ExcelIcon />
                <span>Xuất excel</span>
              </div>
            ) : (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            )}
          </div>
        </div>

        <div className='flex-1 overflow-x-auto'>
          <Spin spinning={isLoading || isFetching}>
            <Table
              columns={renderMyBooking({
                pageSize: data?.pagination?.currentPage,
                t,
              })}
              rowKey='key'
              className='cursor-pointer rounded-[10px]'
              dataSource={dataTable || []}
              onChange={handlePagination}
              pagination={{
                current: data?.pagination?.currentPage,
                total: data?.pagination?.totalCount,
                showSizeChanger: false,
                defaultPageSize: QUERY_PARAMS.pageSize,
                itemRender: ItemControlTableRender,
              }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setIsViewBooking(true);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //  @ts-ignore
                    setIdbooking(record.booking_id);
                  }, // click row
                };
              }}
              bordered
              scroll={{ y: 650, x: 600 }}
            />
          </Spin>
          {isViewBooking && (
            <ModalViewBooking
              id={idBooking}
              onClose={() => setIsViewBooking(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default withPrivateRouteUser(ManageContainer);
