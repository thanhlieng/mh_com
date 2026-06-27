/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { mappingHomepageDetail } from '@/utils/common-function';

export const renderColumns = ({
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
      content: 'Bạn có chắc chắn muốn xóa nhân viên này không?',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => handleDelete(row),
    });
  };
  const POLICY_COLUMNS: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 40,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Nội dung (Tiếng Việt)',
      dataIndex: 'nameVi',
      key: 'nameVi',
      align: 'center',
      width: 200,
    },
    {
      title: 'Nội dung (Tiếng Anh)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      align: 'center',
      width: 200,
    },
    {
      title: 'Đường dẫn',
      key: 'link',
      align: 'center',
      width: 200,
      render: (index) => {
        const mappingData = mappingHomepageDetail(index, 'vi');
        return (
          <a href={mappingData.href} rel='noopener noreferrer' target='_blank'>
            {mappingData.href}
          </a>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 200,
    },
    {
      title: 'Loại đường dẫn',
      dataIndex: 'typeLink',
      key: 'typeLink',
      align: 'center',
      width: 200,
    },
    {
      title: 'Thời gian tạo bài viết',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 200,
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
          <DeleteOutlined onClick={() => handleDeleteRow(record.id)} />
        </div>
      ),
    },
  ];

  return POLICY_COLUMNS;
};
