/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

import {
  CustomerStatus,
  CustomerType,
  EAddressBookingType,
  ICustomer,
  NetWorkCustomerType,
  ResponseGetBookingAddress,
  ServiceEnum,
} from '../types';
import { countries } from '../types/Country';
import { formatNumberWithCommas } from '@/utils/ultils';

export const CUSTOMER_COLUMNS: ColumnsType<ICustomer> = [
  {
    title: 'Tình trạng khách hàng',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 150,
    render: (status: string) => {
      return <span>{CustomerStatus[status as 'ACTIVE']}</span>;
    },
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customerCode',
    key: 'customerCode',
    align: 'center',
    width: 150,
  },
  {
    title: 'Tên khách hàng',
    dataIndex: 'fullName',
    key: 'fullName',
    align: 'center',
    width: 200,
  },
  {
    title: 'Công ty quản lý khách hàng',
    dataIndex: ['company', 'name'],
    key: 'company',
    align: 'center',
    width: 200,
  },
  {
    title: 'Địa chỉ chi tiết',
    dataIndex: 'detailAddress',
    key: 'detailAddress',
    align: 'center',
    width: 300,
  },
  {
    title: 'Địa chỉ chi tiết (Tiếng Anh)',
    dataIndex: 'detailAddressEn',
    key: 'detailAddressEn',
    align: 'center',
    width: 300,
  },
  {
    title: 'Phường/Xã',
    dataIndex: 'commune',
    key: 'commune',
    align: 'center',
    width: 150,
  },

  {
    title: 'Quận/Huyện',
    dataIndex: 'district',
    key: 'district',
    align: 'center',
    width: 150,
  },
  {
    title: 'Thành phố',
    dataIndex: 'province',
    key: 'province',
    align: 'center',
    width: 150,
  },
  {
    title: 'Quốc gia',
    dataIndex: 'country',
    key: 'country',
    align: 'center',
    width: 150,
  },
  {
    title: 'Mã định danh',
    dataIndex: 'identifier',
    key: 'identifier',
    align: 'center',
    width: 150,
  },
  {
    title: 'Người liên hệ',
    dataIndex: 'contactPerson',
    key: 'contactPerson',
    align: 'center',
    width: 150,
  },
  {
    title: 'SĐT',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    align: 'center',
    width: 150,
  },
  {
    title: 'Mã vùng',
    dataIndex: 'phoneCode',
    key: 'phoneCode',
    align: 'center',
    width: 150,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    align: 'center',
    width: 200,
  },

  {
    title: 'Loại khách hàng',
    dataIndex: 'typeCustomer',
    key: 'typeCustomer',
    align: 'center',
    width: 150,
    render: (typeCustomer: string) => {
      return <span>{CustomerType[typeCustomer as 'DOMESTIC_COMPANY']}</span>;
    },
  },
  {
    title: 'Dịch vụ',
    dataIndex: 'service',
    key: 'service',
    align: 'center',
    width: 150,
    render: (service: string) => {
      return <span>{ServiceEnum[service as 'EXPORT_SERVICE_EXPRESS']}</span>;
    },
  },
  {
    title: 'Loại khách hàng vào mạng',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    width: 150,
    render: (type: string) => {
      return <span>{NetWorkCustomerType[type as 'LOT_CUSTOMER']}</span>;
    },
  },
  {
    title: 'Mã bưu chính',
    dataIndex: 'postCode',
    key: 'postCode',
    align: 'center',
    width: 150,
    render: (type: string) => {
      return <span>{NetWorkCustomerType[type as 'LOT_CUSTOMER']}</span>;
    },
  },
  {
    title: 'Ngày mở mã/ Active lại',
    dataIndex: 'openDate',
    key: 'openDate',
    align: 'center',
    width: 150,
    render: (text: string | Date) =>
      text ? moment(text).format('DD/MM/YYYY') : '',
  },
  {
    title: 'Ghi chú',
    dataIndex: 'note',
    key: 'note',
    align: 'center',
    width: 150,
  },
];

export const renderColumnsGetBookingAddress = ({
  handleDelete,
  handleSetDefault,
  type,
  handleEdit,
  t,
}: {
  handleDelete: (row: ResponseGetBookingAddress) => void;
  handleEdit: (row: ResponseGetBookingAddress) => void;
  handleSetDefault: (row: ResponseGetBookingAddress) => void;
  type: EAddressBookingType;
  t: any;
}) => {
  const handleDeleteRow = (row: ResponseGetBookingAddress) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };

  const handleSetDefaultConfirm = (row: ResponseGetBookingAddress) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có cài đặt địa chỉ này thành địa chỉ mặc định không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleSetDefault(row),
    });
  };

  const columns: ColumnsType<ResponseGetBookingAddress> = [
    {
      title: t('No-STT'),
      key: 'no',
      align: 'center',
      width: 10,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: t("Sender's company name"),
      key: 'senderNameEn',
      dataIndex: 'senderNameEn',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Sending Address 1'),
      key: 'senderAddressEn1',
      dataIndex: 'senderAddressEn1',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Sending Address 2'),
      key: 'senderAddressEn2',
      dataIndex: 'senderAddressEn2',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Sending Address 3'),
      key: 'senderAddressEn3',
      dataIndex: 'senderAddressEn3',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t("Sender's name"),
      key: 'senderContactPerson',
      dataIndex: 'senderContactPerson',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Sending phone number'),
      key: 'senderPhoneNumber',
      dataIndex: 'senderPhoneNumber',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Province'),
      key: 'senderProvince',
      dataIndex: 'senderProvince',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Country'),
      key: 'senderCountry',
      dataIndex: 'senderCountry',
      align: 'center',
      width: 220,
      render: (address) => {
        const senderCountry = countries.find((x) => x.value === address);
        return <span className='text-center'>{senderCountry?.label}</span>;
      },
    },
    {
      title: t('Default'),
      key: 'default',
      dataIndex: 'default',
      align: 'center',
      width: 20,
      render: (value) => {
        return (
          <span className='text-center'>
            {value && <CheckOutlined className='text-green-600' />}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'default',
      dataIndex: 'default',
      align: 'center',
      width: 20,
      render: (value, record) => {
        return (
          !value && (
            <div className='flex flex-row items-center justify-center gap-4'>
              <Tooltip
                placement='bottom'
                title='Chỉnh sửa'
                key={`edit-${Math.random()}`}
              >
                <EditOutlined
                  className='cursor-pointer'
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip
                placement='bottom'
                title='Cài đặt mặc định'
                key={`set-defalut-${Math.random()}`}
              >
                <CheckSquareOutlined
                  className='cursor-pointer'
                  onClick={() => handleSetDefaultConfirm(record)}
                />
              </Tooltip>

              <Tooltip
                placement='bottom'
                title='Xóa'
                key={`delete-${Math.random()}`}
              >
                <DeleteOutlined
                  className='cursor-pointer'
                  onClick={() => handleDeleteRow(record)}
                />
              </Tooltip>
            </div>
          )
        );
      },
    },
  ];

  const cRECEIVER_ADDRESS: ColumnsType<ResponseGetBookingAddress> = [
    {
      title: t('No-STT'),
      key: 'no',
      align: 'center',
      width: 10,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: t('Receiving company name'),
      key: 'receiverName',
      dataIndex: 'receiverName',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Detailed receiving address 1'),
      key: 'receiverAddress1',
      dataIndex: 'receiverAddress1',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Detailed receiving address 2'),
      key: 'receiverAddress2',
      dataIndex: 'receiverAddress2',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Detailed receiving address 3'),
      key: 'receiverAddress3',
      dataIndex: 'receiverAddress3',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Postal Code (postcode)'),
      key: 'receiverPostalCode',
      dataIndex: 'receiverPostalCode',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Recipient'),
      key: 'receiverContactPerson',
      dataIndex: 'receiverContactPerson',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t("Recipient's phone number"),
      key: 'receiverPhoneNumber',
      dataIndex: 'receiverPhoneNumber',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Province/City'),
      key: 'receiverProvince',
      dataIndex: 'receiverProvince',
      align: 'center',
      width: 220,
      render: (address) => {
        return <span className='text-center'>{address}</span>;
      },
    },
    {
      title: t('Country'),
      key: 'receiverCountry',
      dataIndex: 'receiverCountry',
      align: 'center',
      width: 220,
      render: (address) => {
        const senderCountry = countries.find((x) => x.value === address);
        return <span className='text-center'>{senderCountry?.label}</span>;
      },
    },
    {
      title: t('Default'),
      key: 'default',
      dataIndex: 'default',
      align: 'center',
      width: 20,
      render: (value) => {
        return (
          <span className='text-center'>
            {value && <CheckOutlined className='text-green-600' />}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'default',
      dataIndex: 'default',
      align: 'center',
      width: 20,
      render: (value, record) => {
        return (
          !value && (
            <div className='flex flex-row items-center justify-center gap-4'>
              <Tooltip
                placement='bottom'
                title='Chỉnh sửa'
                key={`edit-${Math.random()}`}
              >
                <EditOutlined
                  className='cursor-pointer'
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip
                placement='bottom'
                title='Cài đặt mặc định'
                key={`set-defalut-${Math.random()}`}
              >
                <CheckSquareOutlined
                  className='cursor-pointer'
                  onClick={() => handleSetDefaultConfirm(record)}
                />
              </Tooltip>

              <Tooltip
                placement='bottom'
                title='Xóa'
                key={`delete-${Math.random()}`}
              >
                <DeleteOutlined
                  className='cursor-pointer'
                  onClick={() => handleDeleteRow(record)}
                />
              </Tooltip>
            </div>
          )
        );
      },
    },
  ];

  const returnColumns = (type: EAddressBookingType) => {
    switch (type) {
      case EAddressBookingType.RECEIVER_ADDRESS:
        return cRECEIVER_ADDRESS;

      default:
        return columns;
    }
  };

  return returnColumns(type);
};

export const categoriesMaster = ({
  type,
  handleUpdateRow,
  handleDelteRow,
}: {
  type: any;
  handleUpdateRow: (record: any) => void;
  handleDelteRow: (record: any) => void;
}) => {
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelteRow(record),
    });
  };
  const columnsDefault: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 70,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Tên',
      key: 'name',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            className='cursor-pointer'
            onClick={() => handleUpdateRow({ ...record, idKey: index })}
          />
          <DeleteOutlined
            className='cursor-pointer'
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];
  const clumnsSERVICE_PARTNER: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 70,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Tên',
      key: 'name',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: 'Code Aftership',
      key: 'codeAftership',
      dataIndex: 'codeAftership',
      align: 'center',
      render: (_text, record) => {
        return <span className='text-center'>{_text}</span>;
      },
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            className='cursor-pointer'
            onClick={() => handleUpdateRow({ ...record, idKey: index })}
          />
          <DeleteOutlined
            className='cursor-pointer'
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];
  const clumnsSERVICE_BOOKING: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 70,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Tên',
      key: 'name',
      dataIndex: 'name',
      align: 'center',
    },

    {
      title: 'Hệ số dịch vụ',
      key: 'coefficient',
      dataIndex: 'coefficient',
      align: 'center',
      render: (_text, record) => {
        return <span className='text-center'>{_text}</span>;
      },
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            className='cursor-pointer'
            onClick={() => handleUpdateRow({ ...record, idKey: index })}
          />
          <DeleteOutlined
            className='cursor-pointer'
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];
  const colums_JAPAN_ADDRESS: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 70,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Tên người nhận (Tiếng Anh)',
      key: 'consigneeNameEnglish',
      dataIndex: 'consigneeNameEnglish',
      align: 'center',
    },
    {
      title: 'Tên người nhận (Tiếng Nhật)',
      key: 'consigneeNameJapanese',
      dataIndex: 'consigneeNameJapanese',
      align: 'center',
    },
    {
      title: 'Postal code ',
      key: 'consigneeCode',
      dataIndex: 'consigneeCode',
      align: 'center',
    },
    {
      title: 'Tên công ty đã đăng ký ',
      key: 'registeredCompanyName',
      dataIndex: 'registeredCompanyName',
      align: 'center',
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      dataIndex: 'address',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            className='cursor-pointer'
            onClick={() => handleUpdateRow({ ...record, idKey: index })}
          />
          <DeleteOutlined
            className='cursor-pointer'
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];
  const exchangeRateColumns: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 70,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Từ ngày',
      key: 'timeApplyFrom',
      dataIndex: 'timeApplyFrom',
      align: 'center',
      render: (created_at: string) => {
        return <span>{moment(created_at).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Tới ngày',
      key: 'timeApplyTo',
      dataIndex: 'timeApplyTo',
      align: 'center',
      render: (created_at: string) => {
        return <span>{moment(created_at).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Tỷ giá USD',
      key: 'rate',
      dataIndex: 'rate',
      align: 'center',
      render: (fieldData: number) => {
        return (
          <span className='text-center'>
            {formatNumberWithCommas(fieldData.toFixed(0))} VND
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            className='cursor-pointer'
            onClick={() => handleUpdateRow({ ...record, idKey: index })}
          />
          <DeleteOutlined
            className='cursor-pointer'
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  const getTypeClumns = (key: any) => {
    switch (key) {
      case 'SERVICE_PARTNER':
        return clumnsSERVICE_PARTNER;
      case 'SERVICE_BOOKING':
        return clumnsSERVICE_BOOKING;
      case 'JAPAN_ADDRESS':
        return colums_JAPAN_ADDRESS;
      case 'EXCHANGE_RATE':
        return exchangeRateColumns;
      default:
        return columnsDefault;
    }
  };
  return getTypeClumns(type);
};
