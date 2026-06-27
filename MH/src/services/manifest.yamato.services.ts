/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient2 from '@/utils/axiosClient2';
import HttpRequest from '@/utils/Http-request';

export interface IListRespone {
  data: Array<IManifestYamato>;
  pagination: IPagination;
}
export interface IManifestYamato {
  id: string;
  shipDate: Date; // Ship Date
  handlingType: number; // Handling Type
  shipmentType: string; // Shipment Type
  shipperName: string; // Shipper Name
  shipperAdd1: string; // Shipper Add 1
  shipperAdd2: string; //  Shipper Add 2
  shipperAdd3: string; //  Shipper Add 3
  shipperAdd4: string; //  Shipper Add 4
  shipperPostalCode: string; // Shipper Postal Code
  shipperPhone: string; // Shipper Phone
  packageID: string; //=== Package ID
  trackingNo: string; // Tracking No
  referenceNoManifest: string; //=== Reference No
  cneeCompany: string; // Cnee Company
  cneeAdd1: string; // Cnee Add 1
  cneeAdd2: string; // Cnee Add 2
  cneeAdd3: string; // Cnee Add 3
  cneeAdd4: string; // Cnee Add 4
  cneeTel: string; // Cnee Tel
  cneePostalCode: string; // Cnee Postal Code
  cneeNameInKatakana: string; // Cnee Name in Katakana
  gwManifest: number; //=== GW
  unitOfWeight: string; // Unit of weight
  paymentTermManifest: number; // Payment term
  freightChargeManifest: number; //=== Freight Charge
  itemCode: string; // Item code
  itemNameManifest: string; //=== Item name
  originOfCountry: string; // Origin of Country
  qtyManifest: number; // Qty
  uomManifest: string; // UOM
  unitPriceManifest: number; // Unit Price
  invoiceCurManifest: string; // Invoice Cur
  lengthManifest: number; //=== Length
  widthManifest: number; //=== Width
  heightManifest: number; //=== Height
  lengthUnit: string; // Length Unit
  insurance: string; // Insurance
  consigneeNameJapaneseManifest: string; //=== Consignee Japan name
  consigneeCodeManifest: string; //=== Consignee code
  registeredCompanyNameManifest: string; //===  Registered company name
  addressManifest: string; //=== Address
}

export interface IService {
  id?: string;
  name?: string;
  key?: string;
  codeAftership?: string;
  coefficient?: number;
  typeService: string;
  icon?: string;
  zone?: string;
  timeZoneOffset?: number;
}

export interface IPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}
export interface QueriesParamsList {
  page: number;
  pageSize: number;
  search?: string;
}

export const getListYamatoServices = async (params: QueriesParamsList) => {
  const res = await HttpRequest.get('booking/admin/manifest', {
    params,
  });
  return res as unknown as IListRespone;
};

export const getPartnerServicesManifest = async () => {
  const res = await HttpRequest.get('booking/admin/manifest-partner-services');
  return res as unknown as IService[];
};

export const updateListYamatoServices = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  const res = await HttpRequest.patch(
    `/booking/admin/update-manifest-yamato/${id}`,
    {
      ...data,
    }
  );
  return res as unknown as IListRespone;
};

export const exportExcelManifest = (params: {
  permissionActionKey?: string;
}) => {
  return axiosClient2
    .get(`/booking/admin/export-manifest`, {
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

export const exportAllBill = (params: { permissionActionKey?: string }) => {
  return axiosClient2
    .get(`/booking/admin/generate-booking-manifest-yamato`, {
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
export const exportAllInvoice = (params: { permissionActionKey?: string }) => {
  return axiosClient2
    .get(`/booking/admin/generate-invoice-manifest-yamato`, {
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

export const updateTeamplateServices = async ({ data }: { data: any }) => {
  const res = await HttpRequest.patch(
    `/booking/admin/update-all-manifest-yamato`,
    {
      ...data,
    }
  );
  return res as unknown as IListRespone;
};
