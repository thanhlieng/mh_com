/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Input,
  notification,
  Select,
  Spin,
  Table,
} from 'antd';
import axios from 'axios';
import { debounce } from 'lodash';
import moment from 'moment';
import { ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import FileUpload from '@/components/FileUpLoad';
import ItemControlTableRender from '@/components/TableCustom';

import { renderAdminColumns } from '@/contants/columns/my-booking.columns';
import { BASE_URL, QueryParams3 } from '@/contants/common.constants';
import { QUERY_BOOKING } from '@/contants/query-key/booking.query';
import { ACCSESS_TOKEN } from '@/contants/Storage';
import { BookingStatusPost } from '@/contants/types';
import useGetPermission from '@/hook/getPermission';
import {
  fetchBookingAdmin,
  fetchServicePartnerService,
  generateExcelBooking,
} from '@/services/booking.services';

import ModalViewDetailsBooking from './ModalViewDetailsBooking';

const QUERY_PARAMS: QueryParams3 = {
  page: 1,
  pageSize: 20,
  search: '',
  status: undefined,
  createBookingFrom: moment().startOf('month').format('YYYY-MM-DD'),
  createBookingTo: moment().format('YYYY-MM-DD'),
  isHandle: undefined,
  isHandedFilter: false,
};

const { RangePicker } = DatePicker;

const OrderDetails = () => {
  const [queries, setQueries] = useState<QueryParams3>(QUERY_PARAMS);
  const [isViewBooking, setIsViewBooking] = useState<boolean>(false);
  const [idBooking, setIdbooking] = useState<string | undefined>();
  const [fileList, setFileList] = useState<any | null>(null);
  const { permissions } = useGetPermission();

  const queryClient = useQueryClient();
  const { mutate: generateExcel, isLoading: isLoadingGenerateExcel } =
    useMutation(generateExcelBooking, {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
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
  const { data, isLoading, isFetching } = useQuery(
    [QUERY_BOOKING.GET_BOOKING, queries],
    () => {
      return fetchBookingAdmin({ ...queries });
    }
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

  const { data: partnerServiceData } = useQuery(
    ['fetchPartnerServiceOptions', {}],
    () => fetchServicePartnerService()
  );

  const partnerServiceOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (partnerServiceData?.length < 0) {
      return [];
    } else {
      return [
        {
          value: 'NO_PARTNER_SERVICE_YET',
          label: 'Chưa có dịch vụ đối tác',
        },
      ].concat(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //  @ts-ignore
        partnerServiceData?.map((v) => ({
          value: v.id,
          label: v.name,
        })) || []
      );
    }
  }, [partnerServiceData]);

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current,
    }));
  };

  const handleChangeDateFilter = (value: any) => {
    if (!value) {
      delete queries.createBookingFrom;
      delete queries.createBookingTo;
      setQueries((prev) => ({
        ...prev,
        createBookingFrom: undefined,
        createBookingTo: undefined,
      }));
    } else {
      setQueries((prev) => ({
        ...prev,
        createBookingFrom: moment(value?.[0]).format('YYYY-MM-DD'),
        createBookingTo: moment(value?.[1]).format('YYYY-MM-DD'),
      }));
    }
  };

  const handleGenerateExcelBooking = () => {
    generateExcel(queries);
  };

  const handleChangeIsHandle = (value: boolean) => {
    setQueries((prev) => ({
      ...prev,
      isHandle: value,
    }));
  };

  const handleFilterBillWithStatus = (filter: any) => {
    setQueries((prev) => ({
      ...prev,
      ...filter,
    }));
  };

  const handleChangePartnerService = (value: string) => {
    setQueries((prev) => ({
      ...prev,
      serviceBookingId: value,
    }));
  };

  const handleSetFileList = async (data: any) => {
    const accessToken = localStorage.getItem(ACCSESS_TOKEN);
    const configHeader = { Authorization: `Bearer ${accessToken}` };

    setFileList(data);
    if (data.length > 0) {
      const files = data ? [...data] : [];
      const dataUpload = new FormData();
      files.forEach((file, i) => {
        dataUpload.append(`file`, file, file.name);
      });
      const upload = await axios({
        method: 'POST',
        url: `${BASE_URL}/booking/admin/import-booking`,
        data: dataUpload,
        headers: configHeader,
      });
      if (upload.data) {
        notification.success({
          message: 'Upload dữ liệu thành công',
          placement: 'top',
        });
      } else {
        notification.error({
          message: 'Upload dữ liệu không thành công',
          placement: 'top',
        });
      }
    }
  };

  const handleTableRowClick = (record: any) => {
    if (permissions?.includes('get_booking_detail')) {
      setIsViewBooking(true);
      setIdbooking(record.booking_id);
    }
  };
  return (
    <div>
      <div className='mb-4 flex  flex-wrap gap-4'>
        <div className='w-[200px]'>
          <Input
            placeholder='Tìm kiếm đơn hàng...'
            prefix={<SearchOutlined />}
            className='text-input h-8 '
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSearch(event.target.value)
            }
          />
        </div>

        <RangePicker
          format='DD-MM-YYYY'
          onChange={handleChangeDateFilter}
          className='h-8 w-[300px]'
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          value={
            queries.createBookingFrom && queries.createBookingTo
              ? [
                  moment(queries.createBookingFrom),
                  moment(queries.createBookingTo),
                ]
              : undefined
          }
        />

        {permissions?.includes('import_booking') && (
          <FileUpload
            handleSetFileList={handleSetFileList}
            fileList={fileList}
            label='Import Booking'
          />
        )}
      </div>
      <div className='mb-4 flex flex-wrap gap-4'>
        <Select
          showSearch
          className='w-[200px]'
          onChange={(e) => handleChangePartnerService(e)}
          allowClear
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {partnerServiceOptions?.map((v: any) => (
            <Select.Option value={v.value} key={v.value}>
              {v.label}
            </Select.Option>
          ))}
        </Select>
        <Button
          icon={<DownloadOutlined />}
          type='primary'
          className='h-8'
          onClick={handleGenerateExcelBooking}
          loading={isLoadingGenerateExcel}
        >
          Xuất excel
        </Button>
        <Button
          type='primary'
          className='h-8'
          onClick={() =>
            handleFilterBillWithStatus({
              isHandle: true,
              status: undefined,
              isHandedFilter: undefined,
            })
          }
        >
          Đã xử lý
        </Button>
        <Button
          type='primary'
          className='h-8'
          onClick={() =>
            handleFilterBillWithStatus({
              isHandle: false,
              status: undefined,
              isHandedFilter: undefined,
            })
          }
          danger
        >
          Chưa xử lý
        </Button>
        <Button
          type='primary'
          className='h-8'
          onClick={() =>
            handleFilterBillWithStatus({
              status: BookingStatusPost.CANCEL,
              isHandle: undefined,
              isHandedFilter: undefined,
            })
          }
          danger
        >
          Bill bị hủy
        </Button>
        <Button
          type='primary'
          className='h-8'
          onClick={() =>
            handleFilterBillWithStatus({
              status: BookingStatusPost.CANCEL,
              isHandedFilter: true,
              isHandle: undefined,
            })
          }
          danger
        >
          Bill bị hủy và đã xử lý
        </Button>
        <Button
          type='primary'
          className='h-8'
          onClick={() =>
            handleFilterBillWithStatus({
              status: BookingStatusPost.NOT_DELIVERED_YET,
              isHandedFilter: undefined,
              isHandle: undefined,
            })
          }
        >
          Chưa phát hàng
        </Button>
        <Button
          type='primary'
          className='h-8'
          onClick={() =>
            handleFilterBillWithStatus({
              status: BookingStatusPost.DELIVERED,
              isHandedFilter: undefined,
              isHandle: undefined,
            })
          }
        >
          Đã phát hàng
        </Button>
      </div>
      <Spin spinning={isLoading || isFetching}>
        <Table
          columns={renderAdminColumns({
            pageSize: data?.pagination?.currentPage,
            onClick: handleTableRowClick,
          })}
          rowKey='key'
          onChange={handlePagination}
          dataSource={dataTable || []}
          pagination={{
            current: data?.pagination?.currentPage,
            total: data?.pagination?.totalCount,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          bordered
          scroll={{ y: 700, x: 800 }}
        />
      </Spin>
      {isViewBooking && (
        <ModalViewDetailsBooking
          id={idBooking}
          onClose={() => setIsViewBooking(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails;
