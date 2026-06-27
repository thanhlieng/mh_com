/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
export enum EStatusDeliveryAcftership {
  InfoReceived = 'InfoReceived',
  InTransit = 'InTransit',
  OutForDelivery = 'Out For Delivery',
  AttemptFail = 'Attempt Fail',
  Delivered = 'Delivered',
  AvailableForPickup = 'Available For Pickup',
  Exception = 'Exception',
  Expired = 'Expired',
  Pending = 'Pending',
}

export const checkPointACFColumns = ({
  handleDelete,
  handleUpdate,
}: {
  handleDelete: (id: any) => void;
  handleUpdate: (record: any) => void;
}) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa checkpoint này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };
  const data: ColumnsType<any> = [
    {
      title: 'Thành phố',
      dataIndex: 'city',
      key: 'city',
      align: 'center',
      width: 180,
    },
    {
      title: 'Đất nước',
      dataIndex: 'countryName',
      key: 'countryName',
      align: 'center',
      width: 180,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      align: 'center',
      width: 180,
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      align: 'center',
      width: 180,
      render: (data: EStatusDeliveryAcftership) => {
        return <span>{EStatusDeliveryAcftership[data as 'Pending']}</span>;
      },
    },
    {
      title: 'Thời gian check point',
      dataIndex: 'checkpointTime',
      key: 'checkpointTime',
      align: 'center',
      width: 180,
      render: (created_at: string) => {
        return <span>{dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')}</span>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      align: 'center',
      width: 180,
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 80,
      render: (type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdate({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(record.id)} />
        </div>
      ),
    },
  ];
  return data;
};

export const checkPointMAWBColumns = ({
  handleDelete,
  handleUpdate,
}: {
  handleDelete: (id: any) => void;
  handleUpdate: (record: any) => void;
}) => {
  const handleDeleteRow = (row: any) => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn xóa checkpoint này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };
  const data: ColumnsType<any> = [
    {
      title: 'Mã MAWB',
      dataIndex: ['connect_bill', 'mawbCode'],
      key: 'mawb',
      align: 'center',
      width: 180,
    },
    {
      title: 'Mã BillCode',
      dataIndex: ['booking', 'bookingCode'],
      key: 'bill',
      align: 'center',
      width: 180,
    },
    {
      title: 'Thành phố',
      dataIndex: 'city',
      key: 'city',
      align: 'center',
      width: 180,
    },
    {
      title: 'Đất nước',
      dataIndex: 'countryName',
      key: 'countryName',
      align: 'center',
      width: 180,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      align: 'center',
      width: 180,
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      align: 'center',
      width: 180,
      render: (data: EStatusDeliveryAcftership) => {
        return <span>{EStatusDeliveryAcftership[data as 'Pending']}</span>;
      },
    },
    {
      title: 'Thời gian check point',
      dataIndex: 'checkpointTime',
      key: 'checkpointTime',
      align: 'center',
      width: 180,
      render: (created_at: string) => {
        return <span>{dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')}</span>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      align: 'center',
      width: 180,
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 80,
      render: (type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdate({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(record.id)} />
        </div>
      ),
    },
  ];
  return data;
};
