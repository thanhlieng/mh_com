/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { useEffect } from 'react';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';

import { OpitionType } from '@/contants/types';
import { ModuleName } from '@/services/RolePermission.services';

interface ModalRolePermissionProps {
  onClose: () => void;
  form: FormInstance;
  isOpen: boolean;
  handleSubmit: () => void;
  isEdit: boolean;
  roleList: Array<ModuleName | undefined>;
}

const ModalRolePermission = ({
  onClose,
  form,
  isEdit,
  isOpen,
  handleSubmit,
  roleList,
}: ModalRolePermissionProps) => {
  const createRole = 'Tạo Role';
  const editRole = 'Sửa Role';
  useEffect(() => {
    form.setFieldsValue({
      permissions: roleList,
    });
  }, [form, roleList]);
  return (
    <Modal
      footer={null}
      visible={isOpen}
      title={
        <HeaderModal title={isEdit ? editRole : createRole} onClose={onClose} />
      }
      destroyOnClose
      closable={false}
      onCancel={onClose}
      className='top-[20px] w-[calc(40vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <Form form={form} className=' w-full px-8 py-4'>
        <div className='grid grid-cols-2 gap-4'>
          <Form.Item
            name='name'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tên role',
              },
            ]}
          >
            <VInput label='Tên Role' isHorizal />
          </Form.Item>
          <Form.Item name='active'>
            <VSelect label='Trạng thái' isHorizal>
              <Select.Option value={true}>Đang hoạt động</Select.Option>
              <Select.Option value={false}>Ngừng hoạt động</Select.Option>
            </VSelect>
          </Form.Item>
        </div>

        <Form.List name='permissions'>
          {(fields) => {
            return fields.map(({ key, name, ...restField }) => {
              const value = form
                .getFieldValue('permissions')
                ?.[key].actions.map((v: any) => {
                  return {
                    value: v.action,
                    label: v.description,
                  };
                });
              return (
                <Form.Item
                  name={[
                    name,
                    form.getFieldValue('permissions')[key].module_name,
                  ]}
                  key={key}
                  {...restField}
                >
                  <VSelect
                    mode='multiple'
                    className='w-full rounded-sm'
                    label={form.getFieldValue('permissions')[key].module_name}
                    key={form.getFieldValue('permissions')[key].module_name}
                  >
                    {value.map((v: OpitionType) => (
                      <Select.Option key={v.value} value={v.value}>
                        {v.label}
                      </Select.Option>
                    ))}
                  </VSelect>
                </Form.Item>
              );
            });
          }}
        </Form.List>
      </Form>
      <div className='flex flex-row items-center justify-end gap-4'>
        <Button
          onClick={handleSubmit}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          Lưu
        </Button>
        <Button
          onClick={onClose}
          className='h-[38px] rounded-[10px]  border-0 bg-[#F2F2F2]  text-[14px] leading-[17px] text-[#F5546C] outline-0'
        >
          Hủy
        </Button>
      </div>
    </Modal>
  );
};

export default ModalRolePermission;
