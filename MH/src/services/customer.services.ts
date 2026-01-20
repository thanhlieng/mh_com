/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { BASE_URL, QueryParams2 } from '@/contants/common.constants';
import {
  EAddressBookingType,
  ICustomer,
  IReceiverAddress,
  ISenderAddress,
} from '@/contants/types';
import HttpRequest from '@/utils/Http-request';

export interface CustomerResponse {
  data?: ICustomer[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}

export const fetchCustomer = async ({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search?: string;
}) => {
  const customer = HttpRequest.get('customer', {
    params: { page, pageSize, search },
  });
  return customer as CustomerResponse;
};

export const createCustomer = async (data: Partial<ICustomer>) => {
  const createStaff = HttpRequest.post('customer', { ...data });
  return createStaff;
};

export const getStaff = async () => {
  const staff = HttpRequest.get('staffs/find-all-staff');
  return staff;
};

export const getSmallServices = () => {
  const smallServices = HttpRequest.get('service/small-service');
  return smallServices;
};
export const getCountry = (id?: string) => {
  if (id) {
    const smallServices = HttpRequest.get(`service/zone-small-service/${id}`);
    return smallServices;
  }
};

export const getPrice = (id?: string) => {
  if (id) {
    const smallServices = HttpRequest.get(`service/zone-small-service/${id}`);
    return smallServices;
  }
};

export const uploadFile = async (data: any) => {
  const upload = await axios({
    method: 'post',
    url: `${BASE_URL}/upload-file`,
    data,
  });

  return upload;
};

export const getCompanies = async () => {
  const companies = HttpRequest.get('companies');
  return companies;
};
export const getServices = async () => {
  const service = HttpRequest.get('service');
  return service as unknown as Array<any>;
};

export const getJapanAddress = async (queries: QueryParams2) => {
  const service = HttpRequest.get('categories/japan-address', {
    params: queries,
  });
  return service as unknown as Array<any>;
};

export const deleteServices = async (id: string) => {
  const service = HttpRequest.delete(`service/${id}`);
  return service as any;
};

export const updateServices = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  const service = HttpRequest.patch(`service/${id}`, { ...data });
  return service as unknown as any;
};

export const getUnit = async () => {
  const units = HttpRequest.get('units');
  return units as unknown as Array<any>;
};

export const deleteUnit = async (id: string) => {
  const units = HttpRequest.delete(`units/${id}`);
  return units as unknown as any;
};

export const updateJapanAddress = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  const units = HttpRequest.patch(`categories/japan-address/${id}`, {
    ...data,
  });
  return units as unknown as any;
};

export const updateUnit = async ({ id, data }: { id: string; data: any }) => {
  const units = HttpRequest.patch(`units/${id}`, { ...data });
  return units as unknown as any;
};

export const updateCustomer = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<ICustomer>;
}) => {
  const updateStaff = HttpRequest.patch(`customer/${id}`, data);
  return updateStaff;
};

export const getAddressBook = async ({
  type,
}: {
  type: EAddressBookingType;
}) => {
  const data: Array<any> = await HttpRequest.get('address-book', {
    params: {
      type,
    },
  });
  return data || [];
};

export const updateDefault = async (id: string) => {
  const data = await HttpRequest.patch(
    `address-book/set-default-address/${id}`
  );
  return data;
};

export const deleteDeItemAddressBook = async (id: string) => {
  const data = await HttpRequest.delete(`address-book/${id}`);
  return data;
};

export const createSenderAddress = async (item: { item: ISenderAddress }) => {
  const data = await HttpRequest.post(`/address-book/create-sender-address`, {
    ...item,
  });
  return data;
};

export const createReceiveAddress = async (item: {
  item: IReceiverAddress;
}) => {
  const data = await HttpRequest.post(`/address-book/create-receiver-address`, {
    ...item,
  });
  return data;
};

export const updateReceiveAddress = async ({
  item,
  id,
}: {
  item: IReceiverAddress;
  id?: string;
}) => {
  if (id) {
    const data = await HttpRequest.patch(
      `/address-book/update-receiver-address/${id}`,
      {
        ...item,
      }
    );
    return data;
  }
};

export const updateSenderAddress = async ({
  item,
  id,
}: {
  item: IReceiverAddress;
  id?: string;
}) => {
  if (id) {
    const data = await HttpRequest.patch(
      `/address-book/update-sender-address/${id}`,
      {
        ...item,
      }
    );
    return data;
  }
};
