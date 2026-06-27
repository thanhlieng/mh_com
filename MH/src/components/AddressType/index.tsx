/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, FormInstance, Spin, Table } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import { renderColumnsGetBookingAddress } from '@/contants/columns/customer-columns';
import { EAddressBookingType } from '@/contants/types';
import { ResponseGetBookingAddress } from '@/contants/types';
import useGetAddressBook from '@/hook/getAdressBook';

import ModalFromSender from './ModalAddressSender';

type TAddressType = {
  type: EAddressBookingType;
  form: FormInstance<any>;
  handleDelete: (row: ResponseGetBookingAddress) => void;
  handleSetDefault: (row: ResponseGetBookingAddress) => void;
  onSubmit: (callback: () => void, id?: string) => void;
};

const AddressType = ({
  type,
  handleDelete,
  handleSetDefault,
  onSubmit,
  form,
}: TAddressType) => {
  const { data, isLoading } = useGetAddressBook({
    type,
  });

  const [isAdd, setIsAdd] = React.useState<boolean>(false);
  const [isUpdate, setIsUpdate] = React.useState<boolean>(false);
  const [idKey, setIdKey] = React.useState();

  const handleClick = () => {
    if (isAdd) {
      onSubmit(handleClose, idKey);
    } else {
      setIsAdd(true);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setIsAdd(false);
    setIsUpdate(false);
    setIdKey(undefined);
  };

  const hanldeSubmit = () => {
    if (isAdd) {
      onSubmit(handleClose, idKey);
    } else {
      setIsAdd(true);
    }
  };

  const handleEdit = (row: any) => {
    form.setFieldsValue({ ...row });
    setIdKey(row.id);
    setIsUpdate(true);
  };
  const { t } = useTranslation('booking');
  return (
    <div>
      <div className='flex flex-row gap-4'>
        <Button onClick={handleClick}>{t('Create New')}</Button>
      </div>

      <ModalFromSender
        form={form}
        type={type}
        isUpdate={isUpdate}
        isOpen={isAdd || isUpdate}
        onClose={handleClose}
        hanldeSubmit={hanldeSubmit}
      />

      <Spin spinning={isLoading}>
        <Table
          className='mt-4'
          columns={renderColumnsGetBookingAddress({
            handleDelete,
            handleSetDefault,
            type,
            handleEdit,
            t,
          })}
          dataSource={data}
          pagination={false}
          bordered
        />
      </Spin>
    </div>
  );
};

export default AddressType;
