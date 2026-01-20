/* eslint-disable @typescript-eslint/no-explicit-any */
import { IStaff } from '@/contants/types';
import HttpRequest from '@/utils/Http-request';

export interface CustomerResponse {
  data?: IStaff[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}
export const fetchUsers = async ({
  page,
  pageSize,
  search,
  status,
}: {
  page: number;
  pageSize: number;
  search?: string;
  status?: any;
}) => {
  const users = HttpRequest.get('staffs', {
    params: { page, pageSize, search, status },
  });
  return users as CustomerResponse;
};

// create thong tin nhan vien
export const createStaffs = async (data: Partial<IStaff>) => {
  const createStaff = HttpRequest.post('users/staff', { ...data });
  return createStaff;
};

export const updatePartnerBillCode = async ({
  id,
  handleSetBillCode,
  data,
}: {
  id: string;
  data: any;
  handleSetBillCode: (bill: string) => void;
}) => {
  const updatePartnerBillCode = await HttpRequest.patch(
    `booking/admin/update-partner-bill-code/${id}`,
    { ...data }
  );
  if (updatePartnerBillCode) {
    handleSetBillCode(id);
  }
  return updatePartnerBillCode;
};

export const getListRoleDetails = async ({ id }: { id: string }) => {
  const permission = await HttpRequest.get(`staffs/roles-staff/${id}`);
  return permission as unknown as Array<any>;
};

export const getListRoleActive = async () => {
  const list = await HttpRequest.get('roles/roles-active');
  return list as unknown as Array<{ id: string; role_name: string }>;
};

export const updateRole = async ({ id, data }: { id: string; data: any }) => {
  const update = await HttpRequest.patch(`staffs/update-role/${id}`, {
    roleIds: data,
  });
  return update;
};

export const updateStaff = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<IStaff>;
}) => {
  const updateStaff = await HttpRequest.patch(`staffs/${id}`, { ...data });
  return updateStaff;
};

export const getCheckpointByBillCode = async ({
  billCode,
}: {
  billCode?: string;
}) => {
  if (billCode) {
    const data = (await HttpRequest.get(
      `trackings/checkpoint/${billCode}`
    )) as any;
    return data;
  }
  return [];
};
export const getCheckpointByBillCodeMWA = async ({
  billCode,
}: {
  billCode?: string;
}) => {
  if (billCode) {
    const data = (await HttpRequest.get(
      `checkpoints/checkpoints-by-mawb-code/${billCode}`
    )) as any;
    return data;
  }
  return [];
};

export const creatCheckPoint = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  const res = (await HttpRequest.post(`trackings/admin/checkpoint/${id} `, {
    ...data,
  })) as any;
  return res;
};

export const creatCheckPointMWA = async (data: any) => {
  const res = (await HttpRequest.post(`checkpoints/multiple`, {
    ...data,
  })) as any;
  return res;
};

export const deleteCheckPoint = async (id: string) => {
  return await HttpRequest.delete(`checkpoints/${id}`);
};

export const updateCheckPoint = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  return await HttpRequest.patch(`checkpoints/${id}`, { ...data });
};

export const getListAssignPickUp = () => {
  return HttpRequest.get(`staffs/find-all-staff`);
};
