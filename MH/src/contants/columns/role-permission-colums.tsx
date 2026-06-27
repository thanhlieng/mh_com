import {
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const renderColumsRolePermisson = ({
  handleDelete,
  handleUpdate,
  isDisableUpdate,
  isDisableDelete,
}: {
  handleDelete: (id: any) => void;
  handleUpdate: (record: any) => void;
  isDisableUpdate: boolean;
  isDisableDelete: boolean;
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
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 40,
      render: (_text: any, _object: any, index: number) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Tên Role',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 180,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      width: 180,
      render: (active: boolean) => {
        return (
          <p>
            {active ? (
              <span className='text-green-500'>Đang hoạt động</span>
            ) : (
              <span className='text-red-400'>Ngừng hoạt động</span>
            )}
          </p>
        );
      },
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
      render: (_type: string, record: any, index: number) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          {isDisableUpdate && (
            <EditOutlined
              onClick={() => handleUpdate({ ...record, idKey: index })}
            />
          )}

          {isDisableDelete && (
            <DeleteOutlined onClick={() => handleDeleteRow(record.id)} />
          )}
        </div>
      ),
    },
  ];
  return columns;
};
