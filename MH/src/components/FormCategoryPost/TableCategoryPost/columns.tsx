/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';

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

  const CATEGORY_POST_COLUMNS: ColumnsType<any> = [
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
      title: 'Tên danh mục bài viết (Tiếng việt)',
      dataIndex: 'nameVi',
      key: 'nameVi',
      align: 'center',
      width: 200,
    },
    {
      title: 'Tên danh mục bài viết (Tiếng anh)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      align: 'center',
      width: 200,
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      align: 'center',
      width: 200,
      render: (url: string) => (
        <a href={url} rel='noopener noreferrer' target='_blank'>
          {url}
        </a>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      width: 200,
    },
    {
      title: 'Ngày tạo',
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

  return CATEGORY_POST_COLUMNS;
};
