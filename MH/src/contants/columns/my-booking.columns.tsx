/* eslint-disable react/jsx-key */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import clsx from 'clsx';
import dayjs from 'dayjs';

import {
  CLICK_TO_COPY,
  copyToClipBoard,
  numberWithCommas,
} from '@/utils/helpers';

import { CalculationUnit } from '../common.constants';
import {
  BookingType,
  DetailsBookingPost,
  ETypeStaff,
  IInvoiceDetails,
  IMyBooking,
  OpitionType,
} from '../types';
import { formatNumberWithCommas } from '@/utils/ultils';

const COMMON_CLASS = 'cursor-pointer truncate text-center';
const HIGH_LIGHT_CLASS = 'text-[#1890ff]';
const DEFAULT_CONTAINER = 'min-h-[32px] min-w-[50px] text-center';
const CUSTOMER_CLASS = 'w-[180px] cursor-pointer truncate text-center p-2 m-0';
export const renderBookingDetailsNoAction = (
  commoditiesType: Array<OpitionType>,
  shippingType: Array<OpitionType>,
  t: any
) => {
  const BOOKING_DETAILS: ColumnsType<DetailsBookingPost> = [
    {
      title: t('Unit'),
      dataIndex: 'calculationUnit',
      key: 'calculationUnit',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return <span>{CalculationUnit[type as 'CM_KG']}</span>;
      },
    },
    {
      title: 'Nhóm hàng hóa vận chuyển',
      dataIndex: 'commoditiesTypeId',
      key: 'commoditiesTypeId',
      align: 'center',
      width: 180,
      render: (type: string) => {
        const commoditie = commoditiesType?.filter((x) => x.value === type);
        return commoditie?.map((v) => <span key={v.value}>{v.label}</span>);
      },
    },
    {
      title: 'Mô tả chi tiết hàng hóa',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      width: 180,
    },
    {
      title: 'Xuất xứ hàng hóa',
      dataIndex: 'originItem',
      key: 'originItem',
      align: 'center',
      width: 180,
    },

    {
      title: 'Mặt hàng vận chuyển (Tiếng Anh)',
      dataIndex: 'shippingItemEn',
      key: 'shippingItemEn ',
      align: 'center',
      width: 180,
    },
    {
      title: 'Số kiện hàng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 180,
    },
    {
      title: 'Chiều dài(cm)',
      dataIndex: 'longs',
      key: 'longs',
      align: 'center',
      width: 180,
    },
    {
      title: 'Chiều rộng(cm)',
      dataIndex: 'width',
      key: 'width',
      align: 'center',
      width: 180,
    },
    {
      title: 'Chiều cao(cm)',
      dataIndex: 'height',
      key: 'height',
      align: 'center',
      width: 180,
    },
    {
      title: 'Trọng lượng thực(kg)',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return (
          <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>
        );
      },
    },
    {
      title: 'Trọng lượng cồng kềnh(kg)',
      dataIndex: 'bulkyWeight',
      key: 'bulkyWeight',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return (
          <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note-2',
      align: 'center',
      width: 180,
    },
  ];
  return BOOKING_DETAILS;
};
export const renderBookingDetails = (
  commoditiesType: Array<OpitionType>,
  shippingType: Array<OpitionType>,
  handleDelete: (id: any) => void,
  handleUpdateBooking: (record: any) => void,
  t: any
) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa hàng hóa này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };
  const BOOKING_DETAILS: ColumnsType<DetailsBookingPost> = [
    {
      title: t('Unit'),
      dataIndex: 'calculationUnit',
      key: 'calculationUnit',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return <span>{CalculationUnit[type as 'CM_KG']}</span>;
      },
    },
    {
      title: t('Group of Goods to be Shipped'),
      dataIndex: 'commoditiesTypeId',
      key: 'commoditiesTypeId',
      align: 'center',
      width: 180,
      render: (type: string) => {
        const commoditie = commoditiesType?.filter((x) => x.value === type);
        return commoditie?.map((v) => <span key={v.value}>{v.label}</span>);
      },
    },

    {
      title: t('Detailed Description of Goods'),
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      width: 180,
    },
    {
      title: t('Origin of Goods to Be Shipped'),
      dataIndex: 'originItem',
      key: 'originItem',
      align: 'center',
      width: 180,
    },

    {
      title: t('Item to Be Shipped (English)'),
      dataIndex: 'shippingItemEn',
      key: 'shippingItemEn ',
      align: 'center',
      width: 180,
    },
    {
      title: t('Number of Packages'),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 180,
    },
    {
      title: t('Length(cm)'),
      dataIndex: 'longs',
      key: 'longs',
      align: 'center',
      width: 180,
    },
    {
      title: t('Width(cm)'),
      dataIndex: 'width',
      key: 'width',
      align: 'center',
      width: 180,
    },
    {
      title: t('Height(cm)'),
      dataIndex: 'height',
      key: 'height',
      align: 'center',
      width: 180,
    },
    {
      title: t('Actual weight'),
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return (
          <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>
        );
      },
    },
    {
      title: t('Overhead Weight(kg)'),
      dataIndex: 'bulkyWeight',
      key: 'bulkyWeight',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return (
          <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>
        );
      },
    },
    {
      title: t('Notes'),
      dataIndex: 'note',
      key: 'note-2',
      align: 'center',
      width: 180,
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row gap-8'>
          <EditOutlined
            onClick={() => handleUpdateBooking({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(index)} />
        </div>
      ),
    },
  ];
  return BOOKING_DETAILS;
};

export const renderMyBooking = ({ pageSize, t }: { pageSize: any; t: any }) => {
  const MYBOOKING_COLUMNS: ColumnsType<IMyBooking> = [
    {
      title: t('no'),
      key: 'no',
      align: 'center',
      width: 60,
      fixed: true,
      render: (_text, _object, index) => {
        return (
          <span className='text-center'>{(pageSize - 1) * 20 + index + 1}</span>
        );
      },
    },
    {
      title: t('Booking creation time'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 120,
      fixed: true,
      render: (created_at: string) => {
        return <span>{dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')}</span>;
      },
    },
    {
      title: t('Time of request for pick up'),
      dataIndex: 'estimate_date',
      key: 'estimate_date',
      align: 'center',
      width: 120,
      fixed: true,
      render: (estimatedDate: string) => {
        return (
          <span>{dayjs(estimatedDate).format('DD/MM/YYYY HH:mm:ss')}</span>
        );
      },
    },
    {
      title: t('Reference code'),
      dataIndex: 'reference_code',
      key: 'reference_code',
      align: 'center',
      fixed: true,
      width: 100,
    },
    {
      title: t('Bill code'),
      dataIndex: 'booking_code',
      key: 'booking_code',
      align: 'center',
      width: 180,
      fixed: true,
      render: (bookingCode: string) => (
        <Tooltip placement='bottom' title={CLICK_TO_COPY}>
          <p
            onClick={() => copyToClipBoard(bookingCode)}
            className={HIGH_LIGHT_CLASS}
          >
            {bookingCode}
          </p>
        </Tooltip>
      ),
    },

    // {
    //   title: 'Mã bưu đối tá c',
    //   dataIndex: 'partner_bill_code',
    //   key: 'partner_bill_code',
    //   align: 'center',
    //   width: 180,
    // },
    // {
    //   title: 'Dịch vụ xuất',
    //   dataIndex: 'partner_service_name',
    //   key: 'partner_service_name',
    //   align: 'center',
    //   width: 200,
    // },

    {
      title: t('Customer code'),
      dataIndex: 'customer_code',
      key: 'customer_code',
      align: 'center',
      width: 200,
    },
    // {
    //   title: 'Trạng thái đơn hàng',
    //   dataIndex: 'booking_status',
    //   key: 'booking_status',
    //   align: 'center',
    //   width: 180,
    //   render: (type: string) => {
    //     return <span>{BookingStatus[type as 'NOT_YET_HANDED_OVER']}</span>;
    //   },
    // },
    {
      title: t('Booking type'),
      dataIndex: 'booking_type',
      key: 'booking_type',
      align: 'center',
      width: 180,
      render: (type: string) => {
        return <span>{BookingType[type as 'LICENSE']}</span>;
      },
    },

    {
      title: t('Sender company'),
      dataIndex: 'sender_name',
      key: 'sender_name',
      align: 'center',
      width: 200,
    },
    {
      title: t('Receiver (company)'),
      dataIndex: 'receiver_name',
      key: 'receiver_name',
      align: 'center',
      width: 180,
    },

    {
      title: t('Actual weight'),
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      width: 180,
    },

    {
      title: t('Service'),
      dataIndex: 'services_name',
      key: 'services_name',
      align: 'center',
      width: 180,
    },
    {
      title: t('Bulk weight (kg)'),
      dataIndex: 'bulky_weight',
      key: 'bulky_weight',
      align: 'center',
      width: 180,
    },

    {
      title: t('With invoice/without invoice'),
      dataIndex: 'is_invoice',
      key: 'is_invoice',
      align: 'center',
      width: 130,
      render: (type: string) => {
        return <span>{type ? 'Có' : 'Không'}</span>;
      },
    },
    {
      title: t('Customs declaration'),
      dataIndex: 'customs_declaration_number',
      key: 'customs_declaration_number',
      align: 'center',
      width: 150,
      render: (type: string) => {
        return <span>{type}</span>;
      },
    },
    {
      title: t('Delivery status'),
      dataIndex: ' tracking_tag',
      key: ' tracking_tag',
      align: 'center',
      width: 150,
      render: (tracking_tag: any, record: any) => {
        return (
          <div className='h-full w-full cursor-pointer'>
            <span className={`${record?.is_handle === null && 'text-red-500'}`}>
              {`${record.tracking_tag ?? 'N/A'}`}
            </span>
          </div>
        );
      },
    },
    {
      title: t('Last update time'),
      dataIndex: ' shipment_delivery_date',
      key: ' shipment_delivery_date',
      align: 'center',
      width: 150,
      render: (type: any, record: any) => {
        return (
          <div className='h-full w-full cursor-pointer'>
            <span className={`${record?.is_handle === null && 'text-red-500'}`}>
              {record.shipment_delivery_date &&
                dayjs(record.shipment_delivery_date).format(
                  'DD/MM/YYYY HH:mm:ss'
                )}
            </span>
          </div>
        );
      },
    },
    // {
    //   title: 'Thông tin người nhận',
    //   dataIndex: 'receiver_contact_person',
    //   key: 'receiver_contact_person',
    //   align: 'center',
    //   width: 200,
    // },
    // {
    //   title: 'Ghi chú',
    //   dataIndex: 'booking_note',
    //   key: 'booking_note',
    //   align: 'center',
    //   width: 180,
    // },
  ];

  return MYBOOKING_COLUMNS;
};

export const renderAdminColumns = ({
  pageSize,
  onClick,
}: {
  pageSize: any;
  onClick: (record: any) => void;
}) => {
  const AdminBookingColumns: ColumnsType<IMyBooking> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 60,
      render: (_text, _object, index) => {
        return (
          <div
            onClick={() => onClick(_object)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`text-center ${
                _object?.is_handle === null && 'text-red-500'
              }`}
            >
              {(pageSize - 1) * 20 + index + 1}
            </span>
          </div>
        );
      },
    },
    {
      title: 'TT Xử lý',
      dataIndex: 'is_handle',
      key: 'is_handle',
      align: 'center',
      width: 80,
      render: (isHandle: string, record: any) => (
        <div
          onClick={() => onClick(record)}
          className='h-full w-full cursor-pointer'
        >
          <p className={isHandle ? 'text-green-500	' : 'text-red-500'}>
            {isHandle
              ? 'Đã xử lý'
              : isHandle === null
              ? 'Đã bị hủy'
              : 'Chưa xử lý'}
          </p>
        </div>
      ),
    },
    {
      title: 'Mã Bill MH',
      dataIndex: 'booking_code',
      key: 'booking_code',
      align: 'center',
      width: 200,
      render: (booking_code: string, record: any) => {
        return (
          booking_code && (
            <div className='flex h-full w-full cursor-pointer flex-row items-center justify-center  '>
              <div
                onClick={() => onClick(record)}
                className='flex-1 break-words	break-all'
              >
                <p
                  className={`m-0 p-0 ${
                    record?.is_handle === null && 'text-red-500'
                  }`}
                >
                  {booking_code}
                </p>
              </div>
              <Tooltip placement='bottom' title={CLICK_TO_COPY}>
                <p
                  className='w-[20px]'
                  onClick={() => copyToClipBoard(booking_code)}
                >
                  <CopyOutlined />
                </p>
              </Tooltip>
            </div>
          )
        );
      },
    },
    {
      title: 'Mã Bill đối tác',
      dataIndex: 'partner_bill_code',
      key: 'partner_bill_code',
      align: 'center',
      width: 180,
      render: (booking_code: string, record: any) => {
        return (
          booking_code && (
            <div className='flex h-full w-full cursor-pointer flex-row items-center justify-center gap-4'>
              <div
                onClick={() => onClick(record)}
                className='flex-1 break-words'
              >
                <p
                  className={`m-0 break-all p-0 ${
                    record?.is_handle === null && 'text-red-500'
                  }`}
                >
                  {booking_code}
                </p>
              </div>
              <Tooltip placement='bottom' title={CLICK_TO_COPY}>
                <p
                  className='w-[20px]'
                  onClick={() => copyToClipBoard(booking_code)}
                >
                  <CopyOutlined />
                </p>
              </Tooltip>
            </div>
          )
        );
      },
    },
    {
      title: 'Dịch vụ đối tác',
      dataIndex: 'partner_service_name',
      key: 'partner_service_name',
      align: 'center',
      width: 80,
      render: (partner_service_name: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {partner_service_name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Thời gian yêu cầu lấy hàng',
      dataIndex: 'estimate_date',
      key: 'estimate_date',
      align: 'center',
      width: 120,
      render: (estimate_date: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {dayjs(estimate_date).format('DD/MM/YYYY HH:mm:ss')}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Thời gian tạo booking',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 120,
      render: (created_at: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')}
            </span>
          </div>
        );
      },
    },

    {
      title: 'Loại bưu phẩm bưu kiện',
      dataIndex: 'booking_type',
      key: 'booking_type',
      align: 'center',
      width: 100,
      render: (type: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {BookingType[type as 'LICENSE']}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'customer_code',
      key: 'customer_code',
      align: 'center',
      width: 120,
      render: (customer_code: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {customer_code}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Thông tin gửi',
      dataIndex: 'sender_name',
      key: 'sender_name',
      align: 'center',
      width: 300,
      render: (sender_name: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {sender_name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Thông tin nhận',
      dataIndex: 'receiver_name',
      key: 'receiver_name',
      align: 'center',
      width: 300,
      render: (receiver_name: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {receiver_name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Nước đến',
      dataIndex: 'receiver_country',
      key: 'receiver_country',
      align: 'center',
      width: 100,
      render: (receiver_name: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {receiver_name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'services_name',
      key: 'services_name',
      align: 'center',
      width: 200,
      render: (services_name: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {services_name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Số kiện',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 200,
      render: (quantity: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {quantity}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Trọng lượng thực',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      width: 200,
      render: (weight: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {weight}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Trọng lượng cồng kềnh',
      dataIndex: 'bulky_weight',
      key: 'bulky_weight',
      align: 'center',
      width: 200,
      render: (bulky_weight: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {bulky_weight}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'booking_note',
      key: 'booking_note',
      align: 'center',
      width: 150,
      render: (booking_note: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`m-0 p-0 ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {booking_note}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Mã bưu đối tác kết nối dịch vụ Nội địa trong nước Việt Nam',
      dataIndex: 'partner_bill_code_domestic',
      key: 'partner_bill_code_domestic',
      align: 'center',
      width: 180,
      render: (partner_bill_code_domestic: string, record: any) => {
        return (
          partner_bill_code_domestic && (
            <div className='flex h-full w-full cursor-pointer flex-row items-center justify-center gap-4'>
              <div
                onClick={() => onClick(record)}
                className='flex-1 break-words'
              >
                <p
                  className={`m-0 break-all p-0 ${
                    record?.is_handle === null && 'text-red-500'
                  }`}
                >
                  {partner_bill_code_domestic}
                </p>
              </div>
              <Tooltip placement='bottom' title={CLICK_TO_COPY}>
                <p
                  className='w-[20px]'
                  onClick={() => copyToClipBoard(partner_bill_code_domestic)}
                >
                  <CopyOutlined />
                </p>
              </Tooltip>
            </div>
          )
        );
      },
    },
    {
      title: 'Dịch vụ đối tác trong nước',
      dataIndex: 'partner_service_domestic_name',
      key: 'partner_service_domestic_name',
      align: 'center',
      width: 180,
      render: (partner_service_domestic_name: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`text-center  ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {partner_service_domestic_name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Mã bưu đối tác tracking',
      dataIndex: 'reference_code',
      key: 'reference_code',
      align: 'center',
      width: 180,
      render: (reference_code: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span
              className={`text-center  ${
                record?.is_handle === null && 'text-red-500'
              }`}
            >
              {reference_code}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'booking_status',
      key: 'booking_status',
      align: 'center',
      width: 150,
      render: (type: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span className={`${record?.is_handle === null && 'text-red-500'}`}>
              {type}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Tình trạng phát hàng',
      dataIndex: ' tracking_tag',
      key: ' tracking_tag',
      align: 'center',
      width: 150,
      render: (tracking_tag: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span className={`${record?.is_handle === null && 'text-red-500'}`}>
              {`${record.tracking_tag ?? 'N/A'} (${
                record.latest_delivery_message ?? 'N/A'
              })`}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Thời gian cập nhật cuối',
      dataIndex: ' shipment_delivery_date',
      key: ' shipment_delivery_date',
      align: 'center',
      width: 150,
      render: (type: any, record: any) => {
        return (
          <div
            onClick={() => onClick(record)}
            className='h-full w-full cursor-pointer'
          >
            <span className={`${record?.is_handle === null && 'text-red-500'}`}>
              {record.shipment_delivery_date &&
                dayjs(record.shipment_delivery_date).format(
                  'DD/MM/YYYY HH:mm:ss'
                )}
            </span>
          </div>
        );
      },
    },
  ];
  return AdminBookingColumns;
};

export const renderInvoiceDetails = (
  handleDeleteInvoice: (id: any) => void,
  handleUpdateInvoice: (form: any) => void,
  t: any
) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa hàng hóa này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDeleteInvoice(row),
    });
  };
  const INVOICE_DETAILS: ColumnsType<IInvoiceDetails> = [
    {
      title: t('Name of goods'),
      dataIndex: 'goodsName',
      key: 'goodsName',
      align: 'center',
      width: 180,
    },
    {
      title: t('Description of goods'),
      dataIndex: 'describe',
      key: 'describe',
      align: 'center',
      width: 200,
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 180,
    },
    {
      title: t('Unit of measurement'),
      dataIndex: 'unitOfMeasure',
      key: 'unitOfMeasure',
      align: 'center',
      width: 180,
    },
    {
      title: t('Unit price'),
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 180,
      render: (price: any) => {
        return (
          <div>
            {price !== undefined && price !== null
              ? Number(price).toFixed(2)
              : '0.00'}
          </div>
        );
      },
    },
    {
      title: t('Total amount'),
      dataIndex: 'totalMoney',
      key: 'totalMoney',
      align: 'center',
      width: 180,
      render: (totalMoney: any) => {
        return (
          <div>
            {totalMoney !== undefined && totalMoney !== null
              ? Number(totalMoney).toFixed(2)
              : '0.00'}
          </div>
        );
      },
    },
    {
      title: t('Weight'),
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      width: 180,
      render: (weight: any) => {
        return (
          <div>
            {weight !== undefined && weight !== null
              ? Number(weight).toFixed(2)
              : '0.00'}
          </div>
        );
      },
    },
    {
      title: t('Origin'),
      dataIndex: 'originOfGoods',
      key: 'originOfGoods',
      align: 'center',
      width: 180,
    },
    {
      title: 'HS Code',
      dataIndex: 'HSCode',
      key: 'HSCode',
      align: 'center',
      width: 180,
    },

    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdateInvoice({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(index)} />
        </div>
      ),
    },
  ];

  return INVOICE_DETAILS;
};
export const INVOICE_DETAILS_ABC: ColumnsType<DetailsBookingPost> = [
  {
    title: 'Tên hàng hóa',
    dataIndex: 'goodsName',
    key: 'goodsName',
    align: 'center',
    width: 180,
  },
  {
    title: 'Mô tả hàng hóa',
    dataIndex: 'describe',
    key: 'describe',
    align: 'center',
    width: 180,
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    width: 180,
  },
  {
    title: 'Đơn vị tính',
    dataIndex: 'unitOfMeasure',
    key: 'unitOfMeasure',
    align: 'center',
    width: 180,
  },
  {
    title: 'Đơn giá',
    dataIndex: 'price',
    key: 'price',
    align: 'center',
    width: 180,
  },
  {
    title: 'Thành tiền',
    dataIndex: 'totalMoney',
    key: 'totalMoney',
    align: 'center',
    width: 180,
  },
  {
    title: 'Cân nặng',
    dataIndex: 'weight',
    key: 'weight',
    align: 'center',
    width: 180,
  },
  {
    title: 'Xuất xứ',
    dataIndex: 'originOfGoods',
    key: 'originOfGoods',
    align: 'center',
    width: 180,
  },
  {
    title: 'HS Code',
    dataIndex: 'HSCode',
    key: 'HSCode',
    align: 'center',
    width: 180,
  },
];

export const INVOICE_DETAILS: ColumnsType<IInvoiceDetails> = [
  {
    title: 'Tên hàng hóa',
    dataIndex: 'goodsName',
    key: 'goodsName',
    align: 'center',
    width: 180,
  },
  {
    title: 'Mô tả hàng hóa',
    dataIndex: 'describe',
    key: 'describe',
    align: 'center',
    width: 180,
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    width: 180,
  },
  {
    title: 'Đơn vị tính',
    dataIndex: 'unitOfMeasure',
    key: 'unitOfMeasure',
    align: 'center',
    width: 180,
  },
  {
    title: 'Đơn giá',
    dataIndex: 'price',
    key: 'price',
    align: 'center',
    width: 180,
  },
  {
    title: 'Thành tiền',
    dataIndex: 'totalMoney',
    key: 'totalMoney',
    align: 'center',
    width: 180,
  },
  {
    title: 'Cân nặng',
    dataIndex: 'weight',
    key: 'weight',
    align: 'center',
    width: 180,
  },
  {
    title: 'Xuất xứ',
    dataIndex: 'originOfGoods',
    key: 'originOfGoods',
    align: 'center',
    width: 180,
  },
  {
    title: 'HS Code',
    dataIndex: 'HSCode',
    key: 'HSCode',
    align: 'center',
    width: 180,
  },
];

export const columsStaff = ({
  arrayStaff,
  handleDelete,
  handleUpdate,
}: {
  arrayStaff: Array<OpitionType>;
  handleDelete: (id: any) => void;
  handleUpdate: (record: any) => void;
}) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa nhân viên này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'staffId',
      key: 'staffId',
      align: 'center',
      width: 180,
      render: (staffId: string) => (
        <div>
          {arrayStaff?.find((x: OpitionType) => x.value === staffId)?.label}
        </div>
      ),
    },
    {
      title: 'Loại nhân viên',
      dataIndex: 'typeStaff',
      key: 'typeStaff',
      align: 'center',
      width: 180,
      render: (typeStaff: string) => (
        <div>{ETypeStaff[typeStaff as 'DEBT_COLLECTOR']}</div>
      ),
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdate({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(index)} />
        </div>
      ),
    },
  ];
  return columns;
};

export const columnsContract = ({
  opitionTypeContract,
  opitionStaff,
  opitionServices,
  handleDelete,
  handleUpdate,
}: {
  opitionTypeContract: Array<OpitionType>;
  opitionStaff: Array<OpitionType>;
  opitionServices: Array<OpitionType>;
  handleDelete: (id: any) => void;
  handleUpdate: (record: any) => void;
}) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa hàng hóa này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };
  const contract: ColumnsType<any> = [
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
      render: (createdAt: string) => (
        <div>{dayjs(createdAt).format('DD-MM-YYYY  HH:mm:ss')}</div>
      ),
    },
    {
      title: 'Mã phụ lục hợp đồng',
      dataIndex: 'contractCode',
      key: 'contractCode',
      align: 'center',
      width: 180,
      render: (contractCode: string) => <div>{contractCode}</div>,
    },
    {
      title: 'Tên phụ lục hợp đồng',
      dataIndex: 'contractName',
      key: 'contractName',
      align: 'center',
      width: 180,
      render: (contractName: string) => <div>{contractName}</div>,
    },
    {
      title: 'Dịch vụ sử dụng',
      dataIndex: 'service',
      key: 'service',
      align: 'center',
      width: 180,
      render: (service: string) => (
        <div>
          {
            opitionServices?.find((x: OpitionType) => x.value === service)
              ?.label
          }
        </div>
      ),
    },
    {
      title: 'Loại hợp đồng/ Loại phụ lục hợp đồng',
      dataIndex: 'typeContract',
      key: 'typeContract',
      align: 'center',
      width: 180,
      render: (typeContract: string) => (
        <div>
          {
            opitionTypeContract?.find(
              (x: OpitionType) => x.value === typeContract
            )?.label
          }
        </div>
      ),
    },
    {
      title: 'Lịch thanh toán công nợ kể từ ngày xuất hóa đơn',
      dataIndex: 'paymentSchedule',
      key: 'paymentSchedule',
      align: 'center',
      width: 180,
      render: (paymentSchedule: string) => {
        return <div>{paymentSchedule}</div>;
      },
    },

    {
      title: 'Thời hạn hợp đồng',
      dataIndex: 'contactTerm',
      key: 'contactTerm',
      align: 'center',
      width: 140,
      render: (contactTerm: Array<any>) => (
        <div>{`Từ: ${dayjs(contactTerm[0]).format(
          'DD-MM-YYYY'
        )} \n Đến :${dayjs(contactTerm[1]).format('DD-MM-YYYY')}`}</div>
      ),
    },
    {
      title: 'Thẩm định',
      dataIndex: 'expertise',
      key: 'expertise',
      align: 'center',
      width: 140,
      render: (expertise: number) => (
        <div>{expertise ? 'Đã thẩm định' : 'Chưa thầm định'}</div>
      ),
    },
    {
      title: 'Nhân viên thẩm định',
      dataIndex: 'appraisalStaff',
      key: 'appraisalStaff',
      align: 'center',
      width: 140,
      render: (appraisalStaff: string) => {
        return (
          <div>
            {
              opitionStaff.find((x: OpitionType) => x.value === appraisalStaff)
                ?.label
            }
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdate({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(index)} />
        </div>
      ),
    },
  ];
  return contract;
};

export const columsOrdersCode = ({
  opitionServices,
  opitionFixedPriceCode,
  handleDelete,
  handleUpdate,
  dataZone,
}: {
  opitionServices: Array<OpitionType>;
  opitionFixedPriceCode: Array<OpitionType>;
  dataZone?: Array<any>;
  handleDelete: (id: any) => void;
  handleUpdate: (record: any) => void;
}) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa bảng giá này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };
  const ordersCode: ColumnsType<any> = [
    {
      title: 'Thời gian cập nhật',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
      render: (createdAt: string | Date) => (
        <div>{dayjs(createdAt).format('DD-MM-YYYY HH:mm:ss')}</div>
      ),
    },
    {
      title: 'Dịch vụ yêu cầu',
      dataIndex: 'serviceRequestId',
      key: 'serviceRequestId',
      align: 'center',
      width: 180,
      render: (serviceRequestId: string) => (
        <div>
          {
            opitionServices?.find(
              (x: OpitionType) => x.value === serviceRequestId
            )?.label
          }
        </div>
      ),
    },

    {
      title: 'Doanh thu tiềm năng từ (triệu đồng)',
      dataIndex: 'potentialRevenueFrom',
      key: 'potentialRevenueFrom',
      align: 'center',
      width: 180,
      render: (potentialRevenueFrom: string) => (
        <div>{numberWithCommas(potentialRevenueFrom)}</div>
      ),
    },
    {
      title: 'Doanh thu tiềm năng đến (triệu đồng)',
      dataIndex: 'potentialRevenueTo',
      key: 'potentialRevenueTo',
      align: 'center',
      width: 180,
      render: (potentialRevenueFrom: string) => (
        <div>{numberWithCommas(potentialRevenueFrom)}</div>
      ),
    },
    {
      title: 'Bảng giá yêu cầu',
      dataIndex: 'priceListRequested',
      key: 'priceListRequested',
      align: 'center',
      width: 140,
    },
    {
      title: 'Mã bảng giá cố định',
      dataIndex: 'fixedPriceCode',
      key: 'fixedPriceCode',
      align: 'center',
      width: 180,
      render: (fixedPriceCode: string) => (
        <div>
          {
            opitionFixedPriceCode?.find(
              (x: OpitionType) => x.value === fixedPriceCode
            )?.label
          }
        </div>
      ),
    },
    {
      title: 'Mã bảng giá chứng từ',
      dataIndex: 'priceCodeDocument',
      key: 'priceCodeDocument',
      align: 'center',
      width: 180,
      render: (priceCodeDocument: string) => (
        <div>
          {
            opitionFixedPriceCode?.find(
              (x: OpitionType) => x.value === priceCodeDocument
            )?.label
          }
        </div>
      ),
    },
    {
      title: 'Mã bảng giá hàng nhẹ',
      dataIndex: 'lightPriceCode',
      key: 'lightPriceCode',
      align: 'center',
      width: 180,
      render: (lightPriceCode: string) => (
        <div>
          {
            opitionFixedPriceCode?.find(
              (x: OpitionType) => x.value === lightPriceCode
            )?.label
          }
        </div>
      ),
    },
    {
      title: 'Mã bảng giá hàng nặng',
      dataIndex: 'heavyPriceCode',
      key: 'heavyPriceCode',
      align: 'center',
      width: 180,
      render: (heavyPriceCode: string) => (
        <div>
          {
            opitionFixedPriceCode?.find(
              (x: OpitionType) => x.value === heavyPriceCode
            )?.label
          }
        </div>
      ),
    },

    {
      title: 'Giá khác',
      dataIndex: 'otherPrice',
      key: 'otherPrice',
      align: 'center',
      width: 180,
      render: (otherPrice: Array<any>, record: any) => {
        return record?.otherPrices?.length > 0 ? (
          <div>
            {record?.otherPrices?.map((v: any) => (
              <div className='grid grid-cols-2'>
                <p className='m-0 p-0'> {v?.country_contract?.name}</p>
                <p className='m-0 p-0'>{v.discountRate}%</p>
              </div>
            ))}
          </div>
        ) : (
          <div>{otherPrice}</div>
        );
      },
    },

    {
      title: 'Thời hạn áp dung mã giảm giá',
      dataIndex: 'timeApply',
      key: 'timeApply',
      align: 'center',
      width: 140,
      render: (timeApply: Array<any>) => (
        <div>
          {`Từ: ${dayjs(timeApply?.[0]).format('DD-MM-YYYY')}\nĐến :${dayjs(
            timeApply?.[1]
          ).format('DD-MM-YYYY')}`}
        </div>
      ),
    },
    {
      title: 'Phụ phí xăng dầu',
      dataIndex: 'surcharge',
      key: 'surcharge',
      align: 'center',
      width: 140,
    },
    {
      title: 'Tỷ giá (VNĐ)',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
      align: 'center',
      width: 140,
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdate({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(index)} />
        </div>
      ),
    },
  ];
  return ordersCode;
};
