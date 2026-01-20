/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, notification, Select, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import VSelect from '@/components/common/VSelect';

import { QUERY_EMPLOYEE } from '@/contants/query-key/employee.contants';
import {
  getListRoleActive,
  getListRoleDetails,
  updateRole,
} from '@/services/employee.services';

const PermissonEmployee = ({ id }: { id: string }) => {
  const [form] = useForm();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery([QUERY_EMPLOYEE.GET_EMPLOYEE, id], () =>
    getListRoleDetails({ id })
  );

  const { data: getRoleActive, isLoading: isLoadingActive } = useQuery(
    [QUERY_EMPLOYEE.GET_EMPLOYEE],
    () => getListRoleActive()
  );

  const { mutate: updateRolePermission } = useMutation(updateRole, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_EMPLOYEE.GET_EMPLOYEE]);
      notification.success({
        message: 'Cập nhật Role thành công',
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật Role thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const handleSubmit = async () => {
    const res = await form.getFieldsValue();
    updateRolePermission({
      id,
      data: res.roleIds,
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      roleIds: data?.map((v) => ({ value: v.id, label: v.role_name })) || [],
    });

    return () => {
      form.resetFields();
    };
  }, [data, form]);

  return (
    <Spin spinning={isLoadingActive || isLoading}>
      <Form form={form}>
        <Form.Item name='roleIds'>
          <VSelect
            label='Quyền hạn'
            mode='multiple'
            className='w-full'
            isHorizal
          >
            {getRoleActive?.map((v) => (
              <Select.Option key={v?.id} value={v?.id}>
                {v?.role_name}
              </Select.Option>
            ))}
          </VSelect>
        </Form.Item>

        <Button onClick={handleSubmit}>Cập nhật quyền</Button>
      </Form>
    </Spin>
  );
};

export default PermissonEmployee;
