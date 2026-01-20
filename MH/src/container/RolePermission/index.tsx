/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input, notification, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { debounce } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { renderColumsRolePermisson } from '@/contants/columns/role-permission-colums';
import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import useGetPermission from '@/hook/getPermission';
import {
  addRolePermission,
  deleteRole,
  getAllRole,
  getRolePermission,
  ModuleName,
  updateRolePermission,
} from '@/services/RolePermission.services';

import ModalRolePermission from './components/ModalRolePermission';

const GET_ROLE = 'GET_ROLE';
const GET_ALL_ROLE = 'GET_ALL_ROLE';

const RolePermissionContainer = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [form] = useForm();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [listRole, setListRole] = useState<Array<ModuleName | undefined>>([]);
  const { permissions } = useGetPermission();
  const { data: dataRole } = useQuery([GET_ROLE, queries], () =>
    getRolePermission(queries)
  );
  const queryClient = useQueryClient();
  const { mutate: addNewRole } = useMutation(addRolePermission, {
    onSuccess: () => {
      queryClient.invalidateQueries([GET_ROLE]);
      notification.success({
        message: 'Thêm role mới thành công',
        placement: 'top',
      });
      form.resetFields();
      setIsOpen(false);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Thêm role mới thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: deleteRolePermission } = useMutation(deleteRole, {
    onSuccess: () => {
      queryClient.invalidateQueries([GET_ROLE]);
      notification.success({
        message: 'Xóa role thành công',
        placement: 'top',
      });
      form.resetFields();
      setIsOpen(false);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Xóa role thất bại'
        }`,
        placement: 'top',
      });
    },
  });
  const [idRole, setIdRole] = useState<string | null | undefined>(undefined);

  const { mutate: updateRole } = useMutation(updateRolePermission, {
    onSuccess: () => {
      queryClient.invalidateQueries([GET_ROLE]);
      notification.success({
        message: 'Cập nhật role thành công',
        placement: 'top',
      });
      form.resetFields();
      setIsOpen(false);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật role thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { data: dataAllRole, isLoading: dataAllRoleLoading } = useQuery(
    [GET_ALL_ROLE],
    () => getAllRole()
  );

  const handleDeleteRole = (id: string) => {
    if (id) {
      deleteRolePermission(id);
    }
  };
  const handleUpdateRole = (record: any) => {
    setIsEdit(true);
    setIsOpen(true);

    const dataMap = dataAllRole?.map((v) => {
      const permissions = record.permissions.map((e: string) => {
        if (v.actions.map((x) => x.action).includes(e)) {
          const label = v.actions.find(
            (value) => value.action === e
          )?.description;
          return {
            value: e,
            label,
          };
        }
      });

      return {
        ...v,
        [v.module_name]: permissions
          .flat(1)
          .filter((value: any) => value !== undefined),
      };
    });

    setListRole(dataMap || []);
    form.setFieldsValue({
      name: record.name,
      active: record.active,
    });

    setIdRole(record.id);
  };

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const handleSubmit = async () => {
    if (!dataAllRoleLoading) {
      const res = await form.validateFields();
      const newValue = {
        name: res.name,
        active: res.active,
        permissions: dataAllRole
          ?.map((v, i) => res.permissions[i]?.[v.module_name])
          .flat(1)
          .filter((v) => v !== undefined),
      };
      addNewRole(newValue);
    }
  };

  const handleSubmitUpdateRole = async () => {
    if (idRole) {
      const res = await form.validateFields();
      const newValue = {
        name: res.name,
        active: res.active,
        permissions: dataAllRole
          ?.map((v, i) => {
            return res.permissions[i]?.[v.module_name]?.map(
              (v: any) => v?.value || v
            );
          })
          .flat(1)
          .filter((v) => v !== undefined),
      };

      updateRole({ params: newValue, id: idRole });
    }
  };

  useEffect(() => {
    setListRole(dataAllRole || []);
  }, [dataAllRole, form]);

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };
  return (
    <div className='flex flex-col'>
      <div className='flex gap-4 xs:flex-col'>
        <Input
          placeholder='Tìm kiếm ...'
          className='max-w-[350px] xs:max-w-full'
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleSearch(event.target.value)
          }
        />
        {permissions?.includes('create_role') && (
          <Button onClick={() => setIsOpen(true)}> Tạo mới vai trò</Button>
        )}
      </div>

      <Table
        className='mt-4 cursor-pointer'
        columns={renderColumsRolePermisson({
          handleDelete: handleDeleteRole,
          handleUpdate: handleUpdateRole,
          isDisableUpdate: permissions?.includes('get_role_detail') as boolean,
          isDisableDelete: permissions?.includes('remove_role') as boolean,
        })}
        dataSource={dataRole?.data}
        onChange={handlePagination}
        pagination={{
          current: dataRole?.pagination?.currentPage,
          total: dataRole?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
        bordered
      />
      {isOpen && (
        <ModalRolePermission
          form={form}
          isEdit={isEdit}
          handleSubmit={isEdit ? handleSubmitUpdateRole : handleSubmit}
          isOpen={isOpen || isEdit}
          roleList={listRole}
          onClose={() => {
            setIsOpen(false);
            setIsEdit(false);
            setIdRole(undefined);
            form.resetFields();
            setListRole(dataAllRole || []);
          }}
        />
      )}
    </div>
  );
};
export default RolePermissionContainer;
