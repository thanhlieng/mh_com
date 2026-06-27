/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Form, FormInstance, Modal } from 'antd';
import React, { useEffect } from 'react';

import VInputNumber from '@/components/common/VInputNumber';

import { OpitionType } from '@/contants/types';
import { ruleRequeid } from '@/utils/common-function';
import { calculateBulkyWeight } from '@/services/booking.services';

type ModalCreatInfoProps = {
  isUpdate: boolean;
  form: FormInstance;
  servicesId: string;
  handleCancel: () => void;
  handleAddItem: () => void;
  listServices: Array<OpitionType>;
};

const ModalCreatInfo = ({
  isUpdate,
  form,
  servicesId,
  listServices,
  handleCancel,
  handleAddItem,
}: ModalCreatInfoProps) => {
  const handleChange = async () => {
    const width = form.getFieldValue('width');
    const height = form.getFieldValue('height');
    const longs = form.getFieldValue('longs');

    const bulkyWeightResult = await calculateBulkyWeight({
      serviceId: servicesId,
      width: width,
      height: height,
      longs: longs,
      form: 'MH/src/pages/administrator/pickup/container/InfoCheckPoint/ModalInfo/ModalCreate.tsx',
    });

    form.setFieldsValue({ bulkyWeight: bulkyWeightResult });
  };

  useEffect(() => {
    const fetchBulkyWeight = async () => {
      const width = form.getFieldValue('width');
      const height = form.getFieldValue('height');
      const longs = form.getFieldValue('longs');

      const bulkyWeightResult = await calculateBulkyWeight({
        serviceId: servicesId,
        width: width,
        height: height,
        longs: longs,
        form: 'MH/src/pages/administrator/pickup/container/InfoCheckPoint/ModalInfo/ModalCreate.tsx',
      });

      form.setFieldsValue({ bulkyWeight: bulkyWeightResult });
    };

    fetchBulkyWeight();
  }, [form, servicesId]);

  return (
    <Modal
      open={true}
      title={isUpdate ? 'Cập nhập' : 'Tạo mới'}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} className='grid w-full grid-cols-2 gap-4'>
        <Form.Item name='quantity' rules={ruleRequeid()} required>
          <VInputNumber label='Số kiện' isHorizal />
        </Form.Item>
        <Form.Item name='longs' rules={ruleRequeid()} required>
          <VInputNumber label='Dài' isHorizal onChange={handleChange} />
        </Form.Item>
        <Form.Item name='width' rules={ruleRequeid()} required>
          <VInputNumber label='Rộng' isHorizal onChange={handleChange} />
        </Form.Item>
        <Form.Item name='height' rules={ruleRequeid()} required>
          <VInputNumber label='Cao' isHorizal onChange={handleChange} />
        </Form.Item>
        <Form.Item name='bulkyWeight'>
          <VInputNumber label='TL cồng kềnh' isHorizal disabled />
        </Form.Item>
        <Form.Item name='weight' rules={ruleRequeid()} required>
          <VInputNumber label='TL thực' isHorizal />
        </Form.Item>
      </Form>
      <Button
        className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'
        onClick={handleAddItem}
      >
        {isUpdate ? 'Cập nhập' : 'Tạo mới'}
      </Button>
    </Modal>
  );
};
export default ModalCreatInfo;
