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

  const POST_COLUMNS: ColumnsType<any> = [
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
      title: 'Tiêu đề bài viết (Tiếng việt)',
      dataIndex: 'titleVi',
      key: 'titleVi',
      align: 'center',
      width: 200,
    },
    {
      title: 'Tiêu đề bài viết (Tiếng anh)',
      dataIndex: 'titleEn',
      key: 'titleEn',
      align: 'center',
      width: 200,
    },
    {
      title: 'Mô tả ngắn bài viết (Tiếng việt)',
      dataIndex: 'descriptionVi',
      key: 'descriptionVi',
      align: 'center',
      width: 200,
    },
    {
      title: 'Mô tả ngắn bài viết (Tiếng anh)',
      dataIndex: 'descriptionEn',
      key: 'descriptionEn',
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

  return POST_COLUMNS;
};
