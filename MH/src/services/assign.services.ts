/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryParams } from '@/contants/common.constants';
import HttpRequest from '@/utils/Http-request';

export const GET_LIST = 'GET_LIST';
export const GET_LIST_BOOKING = 'GET_LIST_BOOKING';
export const GET_LIST_MY_ASSIGNED_BOOKING = 'GET_LIST_MY_ASSIGNED_BOOKING';
export const getListEmployeeAssign = ({ page, pageSize }: QueryParams) => {
  return HttpRequest.get('staffs/find-all-staff', {
    params: {
      page,
      pageSize,
    },
  }) as unknown as Array<unknown>;
};

export const getAssignBookingPickUp = ({ page, pageSize }: QueryParams) => {
  return HttpRequest.get('booking/admin/assignee-booking-pickup', {
    params: {
      page,
      pageSize,
    },
  }) as unknown as { data: Array<unknown> };
};

export const assignBookingPickUp = ({
  bookingIds,
  staffId,
}: {
  bookingIds: Array<string>;
  staffId: string;
}) => {
  return HttpRequest.post('booking/admin/assignee-booking-for-pickup', {
    staffId,
    bookingIds,
  });
};

export const getMyAssignedBooking = ({
  page,
  pageSize,
  search,
}: QueryParams) => {
  return HttpRequest.get('booking/admin/my-assignee-booking', {
    params: {
      page,
      pageSize,
      search,
    },
  }) as unknown as { data: Array<unknown> };
};

export const confirmPickedUpService = ({
  bookingIds,
}: {
  bookingIds: Array<string>;
}) => {
  return HttpRequest.post('booking/admin/confirm-receipt-of-goods', {
    bookingIds,
  });
};

export const getReport = async (params: {
  staffId?: string;
  from?: string | Date;
  to?: string | Date;
  search?: string;
}): Promise<{
  sumValues: any;
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}> => {
  return await HttpRequest.get('finance-statistical/statistical-staff', {
    params: { ...params },
  });
};

export const getPODReport = async (params: {
  ServiceID?: string;
  from?: string | Date;
  to?: string | Date;
}): Promise<{
  sumValues: any;
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}> => {
  return await HttpRequest.get('connect-bill/analytic-pod', {
    params: { ...params },
  });
};

export const getOrderRemainingReport = async (params: {
  ServiceID?: string;
}): Promise<{
  sumValues: any;
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}> => {
  return await HttpRequest.get('connect-bill/order-remaining', {
    params: { ...params },
  });
};

export const updateOrderRemainingService = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  return HttpRequest.patch(`connect-bill/order-remaining/${id}`, data);
};

export const getStatisticalServiceReport = async (params: {
  year?: string;
}): Promise<{
  sumValues: any;
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}> => {
  return await HttpRequest.get('finance-statistical/statistical-service', {
    params: { ...params },
  });
};

export const getStatisticalCustomerReport = async (params: {
  year?: string;
  serviceID?: string;
}): Promise<{
  sumValues: any;
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}> => {
  return await HttpRequest.get('finance-statistical/statistical-customer', {
    params: { ...params },
  });
};

export const getStatisticalRevenueCustomerReport = async (params: {
  year?: string;
  month?: string;
  typeStatistical?: string;
}): Promise<{
  sumValues: any;
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}> => {
  return await HttpRequest.get(
    'finance-statistical/statistical-revenue-customer',
    {
      params: { ...params },
    }
  );
};
