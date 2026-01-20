/* eslint-disable @typescript-eslint/no-explicit-any */

import queryString from 'query-string';

import { QueryParams3 } from '@/contants/common.constants';
import { BookingStatusPost, IMyBooking, IUser } from '@/contants/types';
import axiosClient2 from '@/utils/axiosClient2';
import HttpRequest from '@/utils/Http-request';

export interface MyBookingResponse {
  data?: IMyBooking[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}

export interface ITrackingResponse {
  data?: any[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}

export const fetchBooking = async ({
  page,
  pageSize,
  search,
  status,
  createBookingFrom,
  createBookingTo,
}: QueryParams3) => {
  const booking = HttpRequest.get('booking/my-booking', {
    params: {
      page,
      pageSize,
      search,
      status,
      createBookingTo,
      createBookingFrom,
    },
  });
  return booking as MyBookingResponse;
};

export const fetchBookingAdmin = async ({
  page,
  pageSize,
  search,
  status,
  createBookingFrom,
  createBookingTo,
  isHandle,
  isHandedFilter,
  serviceBookingId,
}: QueryParams3) => {
  const bookingAdmin = await HttpRequest.get('booking/admin', {
    params: {
      page,
      pageSize,
      search,
      status,
      createBookingFrom,
      createBookingTo,
      isHandle,
      isHandedFilter,
      serviceBookingId,
    },
  });
  return bookingAdmin as MyBookingResponse;
};
export const updateBookingManifest = async ({
  booking,
  id,
}: {
  booking: any;
  id: string;
}) => {
  const body = { ...booking };
  const bookings = await HttpRequest.put(`booking/admin/${id}`, {
    ...body,
  });
  return bookings as MyBookingResponse;
};
export const createBooking = async ({
  booking,
  handleSetId,
  handleSetStatus,
}: {
  booking: any;
  handleSetId: (id: string) => void;
  handleSetStatus: (value: BookingStatusPost) => void;
}) => {
  const bookings = await HttpRequest.post('booking', {
    ...booking,
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //  @ts-ignore
  if (bookings.id) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    handleSetId(bookings.id);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    handleSetStatus(bookings.status);
  }
  return bookings as MyBookingResponse;
};

export const updateBooking = ({
  booking,
  id,
}: {
  booking: any;
  id: string;
}) => {
  const updateBookings = HttpRequest.put(`booking/update-booking/${id}`, {
    ...booking,
  });
  return updateBookings;
};

export const getMyBookingById = async (id: any) => {
  if (id) {
    const booking = HttpRequest.get(`booking/${id}`);
    return booking as any;
  }
};

export const getBookingById = async (id: any) => {
  if (id) {
    const booking = HttpRequest.get(`booking/admin/${id}`);
    return booking as any;
  }
};

export const getStaffAll = async () => {
  return HttpRequest.get(`staffs/find-all-staff`);
};

export const fetchUser = () => {
  const users = HttpRequest.get(`customer/my-profile`);
  return users as unknown as IUser;
};

export const fetchCommoditiesTypeId = () => {
  const users = HttpRequest.get(`commodities-type`);
  return users;
};
export const changePassword = (data: { data: any }) => {
  const users = HttpRequest.patch(`users/change-password`, { ...data });
  return users;
};

export const fetchServicePartnerService = () => {
  const users = HttpRequest.get(`service/partner-service`);
  return users;
};
export const getPostalCode = ({ search }: { search?: string }) => {
  if (search) {
    const data = HttpRequest.get(`/booking/postcode/${search}`);
    return data as any;
  }
};

export const updateSplitBooking = ({
  id,
  payload,
}: {
  id: string;
  payload: any;
}) => {
  const data = HttpRequest.post(`pu-deliveries/split-booking/${id}`, {
    ...payload,
  });
  return data as any;
};
export const postServicesPartner = (data: any) => {
  const users = HttpRequest.post(`service/partner-service`, { ...data });
  return users as unknown as any;
};

export const postServices = (data: any) => {
  const service = HttpRequest.post(`service`, { ...data });
  return service as unknown as any;
};

export const postUnits = (data: any) => {
  const units = HttpRequest.post(`units`, { ...data });
  return units as unknown as any;
};

export const fetchShippingType = () => {
  const users = HttpRequest.get(`shipping-item`);
  return users;
};

export const fetchCheckBillCanBeCancel = (bookingId: string): any => {
  return HttpRequest.get(`booking/admin/check-bill-can-be-cancel/${bookingId}`);
};

export const generateBill = (id: string) => {
  return axiosClient2
    .get('booking/generate-bill', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateBillAdmin = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-bill', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateInvoicePatner = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-partner-bill-invoice', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateExcelBooking = (params: any) => {
  return axiosClient2
    .get('booking/admin/generate-excel-booking', {
      params: params,
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateDowloadList = async (data: {
  endpoint: string;
  params?: object;
}) => {
  return axiosClient2
    .get(data.endpoint, { params: data.params })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateConnectBillOperate = ({
  from,
  to,
}: {
  from?: Date | string;
  to?: Date | string;
}) => {
  return axiosClient2
    .get('connect-bill', {
      params: { from, to },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateConnectBillOperateOP = ({
  from,
  to,
}: {
  from?: Date | string;
  to?: Date | string;
}) => {
  return axiosClient2
    .get('connect-bill/op', {
      params: { from, to },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateMultiParcelOP = ({
  from,
  to,
}: {
  from?: Date | string;
  to?: Date | string;
}) => {
  return axiosClient2
    .get('connect-bill/multi-parcel-op', {
      params: { from, to },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateMultiParcelPickup = ({
  from,
  to,
}: {
  from?: Date | string;
  to?: Date | string;
}) => {
  return axiosClient2
    .get('connect-bill/multi-parcel-pickup', {
      params: { from, to },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateExcelMyBooking = ({
  createBookingFrom,
  createBookingTo,
}: {
  createBookingTo?: Date | string;
  createBookingFrom?: Date | string;
}) => {
  return axiosClient2
    .get('booking/generate-excel-my-booking', {
      params: { createBookingTo, createBookingFrom },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateBillPatner = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-partner-bill', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateReferenceBill = (id: string) => {
  return axiosClient2
    .get('booking/generate-reference-bill', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateSmallBill = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-small-bill', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateSplitBookingBill = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-split-booking-bill', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateOrderCode = (id: string) => {
  return HttpRequest.get(`customer/generate-excel-price-list/${id}`).then(
    (res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    }
  );
};
export const generateInvoice = (id: string) => {
  return axiosClient2
    .get('booking/generate-bill-invoice', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generateInvoiceAdmin = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-bill-invoice', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const generatePartnerInvoiceAdmin = (id: string) => {
  return axiosClient2
    .get('booking/admin/generate-partner-bill-invoice', {
      params: { bookingId: id },
    })
    .then((res: any) => {
      const blob = new Blob([new Uint8Array(res.buffer.data)]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
    });
};

export const fetchServicesBooking = () => {
  const users = HttpRequest.get(`service`);
  return users;
};

export const confirmBooking = (id: string) => {
  const confirmBooking = HttpRequest.patch(
    `booking/admin/is-handle-booking/${id}`
  );
  return confirmBooking;
};

export const trackingBooking = ({
  search,
  page,
  pageSize,
  billCodes,
}: {
  search?: string;
  page: number;
  pageSize: number;
  billCodes: Array<string>;
}) => {
  if (billCodes && billCodes.length > 0) {
    const qs = queryString.stringify(
      { billCodes: billCodes },
      { arrayFormat: 'bracket' }
    );
    const confirmBooking = HttpRequest.get(`trackings?${qs}`, {
      params: {
        search,
        page,
        pageSize,
      },
    });
    return confirmBooking as unknown as ITrackingResponse;
  }
};

export const fetchDeliveryCondition = () => {
  const users = HttpRequest.get(`delivery-conditions`);
  return users as unknown as any[];
};

export const fetchTypeOfPayment = () => {
  const users = HttpRequest.get(`type-of-payment`);
  return users;
};

export const fetchCurrentUnit = () => {
  const users = HttpRequest.get(`currency-unit`);
  return users as unknown as Array<any>;
};
export const updateStatusBooking = async ({
  id,
  handleSetStatus,
}: {
  id: string;
  handleSetStatus: (status: BookingStatusPost) => void;
}) => {
  const resStatus = await HttpRequest.patch(`booking/confirm-booking-v2/${id}`);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //  @ts-ignore
  handleSetStatus(resStatus.status);
  return resStatus;
};
export const cancelBill = async ({
  id,
  reason,
}: {
  id: string;
  reason: string;
}) => {
  const cancelBillOrder = await HttpRequest.patch(
    `booking/cancel-booking/${id}`,
    {
      reason,
    }
  );
  return cancelBillOrder;
};

export const cancelBillAdmin = async ({
  id,
  reason,
}: {
  id: string;
  reason: string;
}) => {
  const cancelBillOrder = await HttpRequest.patch(
    `booking/admin/cancel-booking/${id}`,
    {
      reason,
    }
  );
  return cancelBillOrder;
};

export const myBookingHome = async () => {
  const myBookingHome = await HttpRequest.get(`booking/my-booking-home`);
  return myBookingHome as unknown as {
    bookingNotYetHandedOver: Array<any>;
    bookingHandedOver: Array<any>;
  };
};

export const exportConnect = async (data: any) => {
  return HttpRequest.post(`connect-bill`, {
    ...data,
  }).then((res: any) => {
    const blob = new Blob([new Uint8Array(res.buffer.data)]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = res.filename;
    link.click();
  });
};

export const connectPartnerServices = async () => {
  const connectBill = await HttpRequest.get(`service/connect-partner-service`);
  return connectBill as unknown as Array<any>;
};

export const AddNewInvoice = async (data: any) => {
  const newInvoice = await HttpRequest.post(`invoice/admin`, {
    ...data,
  });

  return newInvoice;
};

export const fetchServicePartnerServiceByZone = (zone: string) => {
  const zoneServices = HttpRequest.get(`service/partner-service?zone=${zone}`);
  return zoneServices as unknown as Array<any>;
};

export const calculateBulkyWeight = async (data: {
  serviceId?: string;
  height: number;
  width: number;
  longs: number;
  form?: string;
}): Promise<number> => {
  delete data.form;

  return HttpRequest.get(`service/calculate-bulky-weight`, {
    params: data,
  });
};

export const getDataCustomerMangerCompanies = () => {
  const companies = HttpRequest.get(`companies`);
  return companies as unknown as Array<any>;
};

export const createDateCustomerManageCompnanies = (data: any) => {
  const companies = HttpRequest.post(`companies`, { ...data });
  return companies as unknown as Array<any>;
};

export const updateCustomerManagerCompanies = ({
  id,
  data,
}: {
  id: any;
  data: any;
}) => {
  const companies = HttpRequest.patch(`companies/${id}`, { ...data });
  return companies as unknown as any;
};

export const deleteCustomerMangerCompanies = (id: any) => {
  const units = HttpRequest.delete(`companies/${id}`);
  return units as unknown as any;
};

export const deleteJapanAddress = (id: any) => {
  const units = HttpRequest.delete(`categories/japan-address/${id}`);
  return units as unknown as any;
};

export const getRequestServices = () => {
  const companies = HttpRequest.get(`service/small-service`);
  return companies as unknown as Array<any>;
};
export const createRequestServices = (data: any) => {
  const companies = HttpRequest.post(`service`, {
    ...data,
    typeService: 'SMALL_SERVICE',
  });
  return companies as unknown as Array<any>;
};

export const updateRequestServices = ({ id, data }: { id: any; data: any }) => {
  const companies = HttpRequest.patch(`service/${id}`, {
    ...data,
  });
  return companies as unknown as any;
};

export const deleteRequestServices = (id: any) => {
  const companies = HttpRequest.delete(`service/${id}`);
  return companies as unknown as any;
};

export const getFixedPrice = async () => {
  return await HttpRequest.get(`categories?key=FIXED_PRICE_LIST_CODE`);
};

export const getExchangeRate = async () => {
  return await HttpRequest.get(`ml-exchange-rate`);
};

export const createFixedPrice = async (data: any) => {
  return (await HttpRequest.post(`categories`, {
    ...data,
    categoryKey: 'FIXED_PRICE_LIST_CODE',
  })) as unknown as Array<any>;
};

export const createJapanAddress = async (data: any) => {
  return (await HttpRequest.post(`categories/japan-address`, {
    ...data,
  })) as unknown as Array<any>;
};

export const createExchangeRate = async (data: any) => {
  return (await HttpRequest.post(`ml-exchange-rate`, {
    ...data,
  })) as unknown as Array<any>;
};

export const updateFixedPrice = async ({
  id,
  data,
}: {
  id: any;
  data: any;
}) => {
  return (await HttpRequest.patch(`categories/${id}`, {
    ...data,
  })) as unknown as any;
};

export const updateExchangeRate = async ({
  id,
  data,
}: {
  id: any;
  data: any;
}) => {
  return (await HttpRequest.put(`ml-exchange-rate/${id}`, {
    ...data,
  })) as unknown as any;
};

export const deleteFixedPrice = async (id: any) => {
  return (await HttpRequest.delete(`categories/${id}`)) as unknown as any;
};

export const deleteExchangeRate = async (id: any) => {
  return (await HttpRequest.delete(`ml-exchange-rate/${id}`)) as unknown as any;
};

export const teamplateInvoiceList = async () => {
  return (await HttpRequest.get(`/invoice/admin/template`)) as unknown as any;
};
export const createTeamplateInvoice = async ({ data }: { data: any }) => {
  return (await HttpRequest.post(`/invoice/admin/template`, {
    ...data,
  })) as unknown as any;
};
export const updateTeamplateInvoiceList = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  return (await HttpRequest.patch(`/invoice/${id}`, {
    ...data,
  })) as unknown as any;
};
export const deleteTeamplateInvoiceList = async (id: string) => {
  return (await HttpRequest.delete(`/invoice/${id}`)) as unknown as any;
};
