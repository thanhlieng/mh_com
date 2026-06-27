/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Modal, notification } from 'antd';
import * as React from 'react';
import { useMutation } from 'react-query';

import { changePassword } from '@/services/booking.services';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Modal cho NCC (supplier) tự đổi mật khẩu tài khoản.
 * Gọi PATCH /api/users/change-password (đã có sẵn ở MH-api/users module).
 */
const ChangePasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const [form] = Form.useForm<FormValues>();

  const { mutateAsync, isLoading } = useMutation(
    // Service signature là `{ data: any }` nhưng implementation spread thẳng
    // vào body, nên callers thực tế truyền payload PHẲNG (xem InfoUser.tsx).
    // Wrap thêm `{ data: ... }` sẽ làm BE nhận body `{ data: {...} }` rồi
    // reject "property data should not exist" + báo các field con thiếu.
    (values: FormValues) => changePassword(values as any),
    {
      onSuccess: () => {
        notification.success({
          message: 'Đổi mật khẩu thành công',
          placement: 'top',
        });
        form.resetFields();
        onClose();
      },
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message ||
            e?.response?.data?.detail ||
            'Đổi mật khẩu thất bại',
          placement: 'top',
        });
      },
    },
  );

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields();
      await mutateAsync(v);
    } catch {
      // form validation lỗi đã hiển thị inline; hoặc mutation lỗi đã toast.
    }
  };

  return (
    <Modal
      open={open}
      title='Đổi mật khẩu'
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText='Cập nhật'
      cancelText='Hủy'
      confirmLoading={isLoading}
      destroyOnClose
      width={460}
    >
      <Form form={form} layout='vertical' requiredMark='optional'>
        <Form.Item
          name='oldPassword'
          label='Mật khẩu hiện tại'
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
            { min: 6, message: 'Tối thiểu 6 ký tự' },
          ]}
        >
          <Input.Password placeholder='••••••' autoComplete='current-password' />
        </Form.Item>

        <Form.Item
          name='newPassword'
          label='Mật khẩu mới'
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Tối thiểu 6 ký tự' },
          ]}
        >
          <Input.Password placeholder='••••••' autoComplete='new-password' />
        </Form.Item>

        <Form.Item
          name='confirmPassword'
          label='Xác nhận mật khẩu mới'
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            { min: 6, message: 'Tối thiểu 6 ký tự' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('Mật khẩu xác nhận không khớp'),
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder='••••••' autoComplete='new-password' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
