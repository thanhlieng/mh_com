import axiosClient2 from '@/utils/axiosClient2';

// ─── Export cost statement ────────────────────────────────────────────────────

export interface CostStatementExportParams {
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
  billCode?: string;
  customer?: string;
  route?: string;
}

/**
 * Request the backend to generate and return an Excel file for the
 * cost-statement report matching the given filters.
 *
 * TODO (backend): implement GET /supplier/cost-statement/export
 *   - Accept query params: from, to, billCode, customer, route
 *   - Return Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *   - Suggested Content-Disposition: attachment; filename="bang-ke-chi-phi.xlsx"
 */
export const exportCostStatement = (
  params: CostStatementExportParams,
): Promise<Blob> => {
  return axiosClient2.get('/supplier/cost-statement/export', {
    params,
    responseType: 'blob',
  }) as Promise<Blob>;
};

// ─── Shipping rate (chi phí vận chuyển theo tuyến) ─────────────────────────────

/**
 * Tải template Excel để điền giá vận chuyển.
 *
 * TODO (backend): implement GET /supplier/shipping-rate/template
 *   - Return Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *   - Content-Disposition: attachment; filename="mau-gia-van-chuyen.xlsx"
 */
export const downloadShippingRateTemplate = (): Promise<Blob> => {
  return axiosClient2.get('/supplier/shipping-rate/template', {
    responseType: 'blob',
  }) as Promise<Blob>;
};

/**
 * Upload file giá vận chuyển mới (Excel/CSV) để backend xử lý import.
 *
 * TODO (backend): implement POST /supplier/shipping-rate/import (multipart/form-data)
 *   - Field: file
 *   - Return: { created: number; updated: number; errors?: string[] }
 */
export const uploadShippingRates = (file: File): Promise<unknown> => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient2.post('/supplier/shipping-rate/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ─── Supplier transactions (màn Bảng kê chi phí) ───────────────────────────────
// Gọi system B: GET /api/supplier/transactions → proxy sang hệ thống A.
// Doc: api/system-b-supplier-transactions.md

export interface SupplierTransactionsParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  q?: string;
  page?: number;
  page_size?: number;
}

/** Phần tử PNL trong danh sách giao dịch */
export interface PnlTransaction {
  type: 'pnl';
  id: number;
  created_at: string;
  invoice_date: string | null;
  contract_number: string | null;
  supplier_id: number;
  supplier_name: string;
  service_name: string;
  service_type: string;
  expense_type: 'normal' | 'invoice_mh';
  cost: number;
  revenue: number;
  cost_after_vat: number;
  revenue_after_vat: number;
  profit: number;
  amount_after_vat: number;
  currency_code: string;
  invoice_exporter: string | null;
  order_id: number | null;
  order_code: string | null;
  booking_bill_number: string | null;
  customer_name: string | null;
}

/** Phần tử Chi hộ trong danh sách giao dịch */
export interface ChiHoTransaction {
  type: 'chi_ho';
  id: number;
  created_at: string;
  invoice_date: string | null;
  contract_number: string | null;
  supplier_id: number;
  supplier_name: string;
  customer_name: string | null;
  vat: number;
  amount: number;
  amount_after_vat: number;
  services: string[];
  invoice_exporter: string | null;
  order_id: number | null;
  order_code: string | null;
  booking_bill_number: string | null;
}

export type SupplierTransaction = PnlTransaction | ChiHoTransaction;

export interface SupplierTransactionsResponse {
  supplier_id: string;
  start_date: string | null;
  end_date: string | null;
  query: string;
  page: number;
  page_size: number;
  total: number;
  results: SupplierTransaction[];
}

export const getSupplierTransactions = (
  params: SupplierTransactionsParams = {},
): Promise<SupplierTransactionsResponse> => {
  return axiosClient2.get('/supplier/transactions', {
    params,
  }) as Promise<SupplierTransactionsResponse>;
};

// ─── Chi hộ files (màn Quản lý chi hộ) ─────────────────────────────────────────
// Gọi system B: GET/POST /api/supplier/chiho-files → proxy sang hệ thống A.
// Doc: api/system-b-supplier-chiho-files.md

export interface ChiHoFile {
  id: number;
  order_id: number;
  file_url: string | null;
  file_name: string | null;
  is_active: boolean;
  source_system: string;
  source_id: string;
  created_at: string;
  created_by: string;
}

export interface ChiHoFilesListResponse {
  order_id: number;
  source_system: string;
  source_id: string;
  count: number;
  data: ChiHoFile[];
}

export interface ChiHoFilesUploadResponse {
  message: string;
  count: number;
  data: ChiHoFile[];
}

/** Liệt kê file Chi hộ đã upload của một đơn hàng */
export const listChiHoFiles = (
  orderId: number | string,
  includeInactive = false,
): Promise<ChiHoFilesListResponse> => {
  return axiosClient2.get('/supplier/chiho-files', {
    params: {
      order_id: orderId,
      ...(includeInactive ? { include_inactive: true } : {}),
    },
  }) as Promise<ChiHoFilesListResponse>;
};

/** Upload một hoặc nhiều file Chi hộ cho một đơn hàng */
export const uploadChiHoFiles = (
  orderId: number | string,
  files: File[],
): Promise<ChiHoFilesUploadResponse> => {
  const formData = new FormData();
  formData.append('order_id', String(orderId));
  files.forEach((file, i) => formData.append(`file${i}`, file));
  return axiosClient2.post('/supplier/chiho-files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<ChiHoFilesUploadResponse>;
};

// ─── Tra cứu đơn hàng theo mã (hệ thống A) ─────────────────────────────────────
// Doc: mhgs_log_be/docs/api/order-by-code.md

export interface ChihosItem {
  id: number;
  amount: number;
  amount_after_vat: number;
  services: string[];
  contract_number: string | null;
  customer_name: string | null;
  invoice_exporter: string | null;
}

export interface OrderByCodeResponse {
  id: number;
  order_code: string;
  booking_bill_number: string | null;
  bl: string | null;
  status: string;
  order_type: string;
  customer_name: string;
  shipper: string;
  chihos: ChihosItem[];
}

const MOCK_ORDER: OrderByCodeResponse = {
  id: 88,
  order_code: 'XK250608001',
  booking_bill_number: 'BOOKING-12345',
  bl: 'BL-001',
  status: 'IN_PROGRESS',
  order_type: 'EXPORT',
  customer_name: 'Công ty TNHH ABC Logistics',
  shipper: 'ABC Logistics',
  chihos: [
    {
      id: 101,
      amount: 5_000_000,
      amount_after_vat: 5_500_000,
      services: ['Thủ tục hải quan', 'Vận chuyển nội địa'],
      contract_number: 'HD-2024-001',
      customer_name: 'Công ty TNHH ABC Logistics',
      invoice_exporter: 'Kho HCM',
    },
    {
      id: 102,
      amount: 12_000_000,
      amount_after_vat: 13_200_000,
      services: ['Vận chuyển đường biển'],
      contract_number: 'HD-2024-002',
      customer_name: 'Công ty TNHH ABC Logistics',
      invoice_exporter: 'Cảng Cát Lái',
    },
  ],
};

/**
 * Tra cứu đơn hàng theo mã (order_code hoặc booking_bill_number).
 * TODO: thay MOCK bằng API call thật khi có proxy endpoint trên system B:
 *   GET /api/order_by_code/?q=<code>
 */
export const getOrderByCode = (
  q: string,
): Promise<OrderByCodeResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (q.toLowerCase().startsWith('not')) {
        reject(new Error('Không tìm thấy đơn hàng'));
        return;
      }
      resolve({ ...MOCK_ORDER, order_code: q });
    }, 600);
  });
};
