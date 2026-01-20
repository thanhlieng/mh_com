/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, notification } from 'antd';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import AddressType from '@/components/AddressType';

import { QUERY_BOOKING_ADDRESS } from '@/contants/query-key/booking.query';
import {
  EAddressBookingType,
  ResponseGetBookingAddress,
} from '@/contants/types';
import {
  createReceiveAddress,
  createSenderAddress,
  deleteDeItemAddressBook,
  updateDefault,
  updateReceiveAddress,
  updateSenderAddress,
} from '@/services/customer.services';

const SenderAddress = ({ type }: { type: EAddressBookingType }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { mutate: updateDefaultItem } = useMutation(updateDefault, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      ]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Cập nhật thất bại',
        placement: 'top',
      });
    },
  });
  const { mutate: addNewAddressBook } = useMutation(createSenderAddress, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      ]);
      notification.success({
        message: 'Thêm địa chỉ mới thành công',
        placement: 'top',
      });
      form.resetFields();
    },
    onError: () => {
      notification.error({
        message: 'Thêm địa chỉ mới  thất bại',
        placement: 'top',
      });
    },
  });
  const { mutate: updateSender } = useMutation(updateSenderAddress, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      ]);
      notification.success({
        message: 'Update địa chỉ mới thành công',
        placement: 'top',
      });
      form.resetFields();
    },
    onError: () => {
      notification.error({
        message: 'Update địa chỉ mới  thất bại',
        placement: 'top',
      });
    },
  });
  const { mutate: addNewReceiveAddress } = useMutation(createReceiveAddress, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      ]);
      notification.success({
        message: 'Thêm địa chỉ mới thành công',
        placement: 'top',
      });
      form.resetFields();
    },
    onError: () => {
      notification.error({
        message: 'Thêm địa chỉ mới  thất bại',
        placement: 'top',
      });
    },
  });
  const { mutate: updateRecevier } = useMutation(updateReceiveAddress, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      ]);
      notification.success({
        message: 'Update địa chỉ mới thành công',
        placement: 'top',
      });
      form.resetFields();
    },
    onError: () => {
      notification.error({
        message: 'Update địa chỉ mới  thất bại',
        placement: 'top',
      });
    },
  });

  const { mutate: deleteItem } = useMutation(deleteDeItemAddressBook, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      ]);
      notification.success({
        message: 'Xóa thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Xóa thất bại',
        placement: 'top',
      });
    },
  });

  const handleDelete = (row: ResponseGetBookingAddress) => {
    if (row.id) {
      deleteItem(row.id);
    }
  };

  const handleSetDefault = (row: ResponseGetBookingAddress) => {
    if (row.id) {
      updateDefaultItem(row.id);
    }
  };

  const handleSubmit = async (callback: () => void, id?: string) => {
    const value = await form.validateFields();
    if (value) {
      if (type === EAddressBookingType.RECEIVER_ADDRESS) {
        if (id) {
          updateRecevier({ item: { ...value }, id: id });
        } else {
          addNewReceiveAddress({ ...value });
        }
      } else {
        if (id) {
          updateSender({ item: { ...value }, id: id });
        } else {
          addNewAddressBook({
            ...value,
          });
        }
      }

      callback();
    }
  };

  return (
    <div className='grid grid-cols-1 gap-4'>
      <AddressType
        type={type}
        handleDelete={handleDelete}
        handleSetDefault={handleSetDefault}
        form={form}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SenderAddress;
