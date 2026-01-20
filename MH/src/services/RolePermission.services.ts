/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryParams } from '@/contants/common.constants';
import HttpRequest from '@/utils/Http-request';

export interface ModuleName {
  module_name: string;
  actions: Array<ActionModule>;
}
interface ActionModule {
  action: string | undefined;
  description: string;
  selected: boolean;
}

export interface RolePermission {
  data: Daum[];
  pagination: Pagination;
}

export interface Daum {
  id: string;
  name: string;
  permissions: string | undefined[];
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPage: number;
  totalCount: number;
}

export const getRolePermission = (
  params: QueryParams
): Promise<RolePermission> => {
  return HttpRequest.get('roles', {
    params: {
      ...params,
    },
  });
};

export const addRolePermission = (params: any) => {
  return HttpRequest.post('roles', {
    ...params,
  });
};

export const updateRolePermission = ({
  params,
  id,
}: {
  params: any;
  id: string;
}) => {
  return HttpRequest.patch(`roles/${id}`, {
    ...params,
  });
};
export const deleteRole = (id: string) => {
  return HttpRequest.delete(`roles/${id}`);
};
export const getAllRole = () => {
  const allRole = HttpRequest.get('roles/module-name');
  return allRole as unknown as Array<ModuleName>;
};
