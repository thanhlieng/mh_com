import { BookingType } from '@/contants/types';
import HttpRequest from '@/utils/Http-request';

export interface IListRepone {
  data: Array<ListRespone>;
  pagination: IPagination;
}

export interface IDetailsLisResPonse {
  id: string;
  booking_code: string;
  created_at: string | Date;
  destination: string;
  booking_type: BookingType;
  billable_weight: string;
  price_usd: string;
  price_vnd: string;
  lkd_price_usd: string;
  lkd_price_vnd: string;
  total_pp_usd: string;
  total_pp_vnd: string;
  total_selling_price_usd: string;
  total_selling_price_vnd: string;
  ppxd_usd: string;
  ppxd_vnd: string;
  total_external_pp_usd: string;
  total_external_pp_vnd: string;
  total_sales_usd: string;
  total_sales_vnd: string;
  vat_usd: string;
  total_sales_including_vat_usd: string;
  vat_vnd: string;
  total_sales_including_vat_vnd: string;
}
export interface ListRespone {
  customer_id: string;
  customer_name: string;
  customer_code: string;
  customer_booking_mobile?: string;
  customer_booking_email?: string;
  last_sent?: string;
  total_sales_including_vat_usd: string;
  total_sales_including_vat_vnd: string;
}
export interface IPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

export interface IParamsList {
  search?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}

export interface QueriesParamsList {
  page: number;
  pageSize: number;
}

export interface QueriesParamsManifest {
  page: number;
  pageSize: number;
  search?: string;
  permissionActionKey?: string;
}

export const getList = async ({
  params,
}: {
  params: IParamsList & QueriesParamsList;
}) => {
  return (await HttpRequest.get('cargo-list', {
    params,
  })) as IListRepone;
};

export const getListDetails = async ({
  params,
}: {
  params: {
    from?: string;
    to?: string;
    customerId: string;
  };
}) => {
  return (await HttpRequest.get('cargo-list/booking-paid', {
    params,
  })) as Array<IDetailsLisResPonse>;
};

export const listSendViaEmail = async ({
  params,
}: {
  params: {
    month?: string;
    year?: string;
    from?: string;
    to?: string;
    customerId: string;
    ids: Array<string>;
    currency: 'VND' | 'USD';
  };
}) => {
  return (await HttpRequest.post('cargo-list/send-cargo-list-via-email', {
    ...params,
  })) as Array<IDetailsLisResPonse>;
};
