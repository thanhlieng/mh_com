import axiosClient2 from '@/utils/axiosClient2';

// ─── Account links (multi-link supplier/customer) ─────────────────────────────
// Gọi system B: GET /api/account/a-links → trả về loại liên kết + danh sách id.
// Một account chỉ thuộc đúng MỘT loại (supplier HOẶC customer).

export type ALinkType = 'supplier' | 'customer';

export interface AccountLinks {
  linkType: ALinkType | null;
  ids: string[];
}

/** Lấy danh sách supplier/customer (bên A) mà account hiện tại được liên kết. */
export const getAccountLinks = (): Promise<AccountLinks> => {
  return axiosClient2.get('/account/a-links') as Promise<AccountLinks>;
};

// ─── (Admin) Danh mục mhvn + quản lý liên kết account ↔ mhvn ───────────────────
// Dùng cho tab "Kết nối mhvn" ở màn quản trị khách hàng. Chỉ ADMIN gọi được.

/** Một thực thể (supplier hoặc customer) bên mhvn để render dropdown chọn. */
export interface MhvnDirectoryEntity {
  id: number;
  company_name: string;
  tax_number: string | null;
  secondary_name: string | null;
  is_active: boolean;
  managed_company?: { id: number | null; company_name: string | null };
}

/** Danh sách supplier (bên mhvn) — service token, chỉ ADMIN. */
export const getMhvnSuppliers = (
  q?: string,
): Promise<{ message: string; suppliers: MhvnDirectoryEntity[] }> => {
  return axiosClient2.get('/directory/suppliers', {
    params: q ? { q } : {},
  }) as Promise<{ message: string; suppliers: MhvnDirectoryEntity[] }>;
};

/** Danh sách customer (bên mhvn) — service token, chỉ ADMIN. */
export const getMhvnCustomers = (
  q?: string,
): Promise<{ message: string; customers: MhvnDirectoryEntity[] }> => {
  return axiosClient2.get('/directory/customers', {
    params: q ? { q } : {},
  }) as Promise<{ message: string; customers: MhvnDirectoryEntity[] }>;
};

/** Lấy liên kết mhvn hiện tại của một account (theo userId). Chỉ ADMIN. */
export const getAccountLinksByUser = (
  userId: string,
): Promise<AccountLinks> => {
  return axiosClient2.get(
    `/admin/account-links/${userId}`,
  ) as Promise<AccountLinks>;
};

/**
 * Thay thế toàn bộ liên kết mhvn của một account. Chỉ ADMIN.
 * `linkType=null` + `ids=[]` để gỡ liên kết. Backend đảm bảo account chỉ
 * thuộc đúng MỘT loại (supplier HOẶC customer).
 */
export const setAccountLinksByUser = (
  userId: string,
  body: { linkType: ALinkType | null; ids: string[] },
): Promise<AccountLinks> => {
  return axiosClient2.put(
    `/admin/account-links/${userId}`,
    body,
  ) as Promise<AccountLinks>;
};

// ─── Export cost statement ────────────────────────────────────────────────────

export interface CostStatementExportParams {
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
  /** Tìm kiếm server-side (mã đơn, booking, container, tuyến, dịch vụ, hoá đơn) */
  q?: string;
}

/**
 * Request the backend to generate and return an Excel file for the
 * cost-statement report matching the given filters.
 *
 * TODO (backend): implement GET /supplier/cost-statement/export
 *   - Accept query params: from, to, q
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
// Doc: api/mhcom-supplier-transactions.md

export interface SupplierTransactionsParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  q?: string;
  page?: number;
  page_size?: number;
}

/**
 * Một dòng giao dịch (PNL hoặc Chi hộ) trong bảng kê chi phí.
 * Contract thống nhất do hệ thống A (Django) trả về — system B proxy nguyên trạng.
 */
export interface SupplierTransaction {
  type: 'pnl' | 'chi_ho';
  id: number;
  order_id: number | null;
  order_code: string | null;
  booking_bill_number: string | null;
  container_no: string; // chi_ho: nhiều cont nối bằng ", "
  container_type: string; // Container.name, '' nếu không có
  route: string; // pnl: "from - to"; chi_ho: ''
  service_name: string; // chi_ho: nhiều dịch vụ nối bằng ", "
  contract_number: string | null;
  amount: number; // cột "Tiền" (pnl.cost hoặc chiho.amount)
  expense_type: 'normal' | 'invoice_mh' | null; // null với chi_ho
  category: 'cost' | 'invoice_mh' | 'chi_ho'; // cột "Loại"
  // editable=false khi: hóa đơn MH, đã có trong request (in_request),
  // hoặc đơn đã COMPLETED (order_completed). chi_ho luôn false.
  editable: boolean;
  in_request?: boolean; // code đã được thêm vào một request → không cho sửa
  order_completed?: boolean; // đơn hàng status=COMPLETED → không cho sửa
  lock_reason?: 'invoice_mh' | 'in_request' | 'order_completed' | 'chi_ho' | null;
  // Các trường phụ trợ (vẫn dùng được nếu cần)
  created_at: string;
  invoice_date: string | null;
  customer_name: string | null;
  supplier_name: string;
  invoice_exporter: string | null;
}

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
// Doc: api/mhcom-supplier-chiho-files.md

export type ChiHoApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ChiHoFile {
  id: number;
  order_id: number;
  file_url: string | null;
  file_name: string | null;
  is_active: boolean;
  source_system: string;
  source_id: string;
  /** Trạng thái duyệt của file (mhgs duyệt trước khi lưu vào đơn). */
  approval_status: ChiHoApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
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

/** Một dòng trong bảng "Danh sách yêu cầu tải lên" (gộp mọi đơn). */
export interface ChiHoUploadRow {
  id: number;
  order_id: number;
  order_code: string | null;
  booking_bill_number: string | null;
  file_url: string | null;
  file_name: string | null;
  approval_status: ChiHoApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ChiHoUploadsListResponse {
  source_ids: string[];
  count: number;
  data: ChiHoUploadRow[];
}

/**
 * Liệt kê TẤT CẢ file Chi hộ supplier đã yêu cầu tải lên, gộp mọi đơn.
 * Phục vụ tab "Danh sách yêu cầu tải lên" ở màn Quản lý chi hộ.
 */
export const listChiHoUploads = (
  status?: ChiHoApprovalStatus,
): Promise<ChiHoUploadsListResponse> => {
  return axiosClient2.get('/supplier/chiho-files/uploads', {
    params: status ? { status } : {},
  }) as Promise<ChiHoUploadsListResponse>;
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

// ─── Đề nghị thay đổi cost (màn Bảng kê chi phí) ──────────────────────────────
// Gọi system B: GET/POST /api/supplier/change-requests → proxy sang hệ thống A.
// Doc: API-service-change-supplier-request.md

export interface CreateChangeRequestPayload {
  pnl: number;
  order: number;
  requested_cost: number;
  reason?: string;
}

export interface ChangeRequestResponse {
  id: number;
  pnl: number;
  order: number;
  supplier: number;
  requested_cost: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
  pnl_data?: {
    id: number;
    service_name: string;
    service_type: string;
    supplier: number;
    supplier_name: string;
    cost: number;
    cost_after_vat: number;
    order_container: number;
  };
  order_data?: {
    id: number;
    order_code: string;
    booking_bill_number: string;
    status: string;
    customer_name: string;
  };
  supplier_data?: {
    id: number;
    company_name: string;
    tax_number: string;
    address: string;
    is_active: boolean;
  };
}

/** Danh sách yêu cầu thay đổi cost của supplier */
export const getChangeRequests = (): Promise<ChangeRequestResponse[]> => {
  return axiosClient2.get('/supplier/change-requests') as Promise<ChangeRequestResponse[]>;
};

/** Tạo yêu cầu thay đổi cost — body là list các thay đổi */
export const createChangeRequest = (
  data: CreateChangeRequestPayload[],
): Promise<ChangeRequestResponse[]> => {
  return axiosClient2.post('/supplier/change-requests', data) as Promise<ChangeRequestResponse[]>;
};

/** Chi tiết một yêu cầu thay đổi cost */
export const getChangeRequestDetail = (
  id: number,
): Promise<ChangeRequestResponse> => {
  return axiosClient2.get(`/supplier/change-requests/${id}`) as Promise<ChangeRequestResponse>;
};

// ─── Yêu cầu thay đổi giá (price-change approval) ─────────────────────────────
// Gọi system B: GET/DELETE /api/supplier/price-changes → proxy sang hệ thống A.
// Token supplier; header X-Active-Supplier-Id tự đính kèm bởi axiosClient2.

export type PriceChangeSource = 'MANUAL' | 'EXCEL';
export type PriceChangeType = 'EDIT_AMOUNT' | 'CREATE' | 'REPLACE';
export type PriceChangeStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFLICT';

/**
 * Một yêu cầu thay đổi giá của supplier hiện tại.
 * Khớp serializer A (mhcom/supplier_price_change_views.py): nhãn tuyến/dịch vụ
 * gộp trong `label`; số tiền là Decimal nên về dạng chuỗi.
 */
export interface SupplierPriceChange {
  id: number;
  source: PriceChangeSource;
  batch_id: string | null;
  change_type: PriceChangeType;
  status: PriceChangeStatus;
  old_amount: number | string | null;
  new_amount: number | string | null;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  resolve_error: string | null;
  /** Nhãn tuyến/dịch vụ/container gộp (best-effort, có thể rỗng) */
  label?: string | null;
}

/** Envelope A trả về: { count, results } — proxy B giữ nguyên. */
export interface SupplierPriceChangesResponse {
  count: number;
  results: SupplierPriceChange[];
}

/** Danh sách yêu cầu thay đổi giá của supplier hiện tại (lọc theo status nếu có) */
export const getSupplierPriceChanges = (
  status?: string,
): Promise<SupplierPriceChangesResponse> => {
  return axiosClient2.get('/supplier/prices/price-changes', {
    params: status ? { status } : {},
  }) as Promise<SupplierPriceChangesResponse>;
};

/** Xóa một yêu cầu thay đổi giá đang ở trạng thái PENDING (204) */
export const deleteSupplierPriceChange = (
  id: number | string,
): Promise<void> => {
  return axiosClient2.delete(`/supplier/prices/price-changes/${id}`) as Promise<void>;
};

// ─── Bảng giá dịch vụ (supplier prices) ───────────────────────────────────────
// Gọi system B: GET/PATCH /api/supplier/prices → proxy sang hệ thống A.
// Token supplier; header X-Active-Supplier-Id tự đính kèm bởi axiosClient2.
// Lưu ý: các trường số tiền là Decimal nên về dạng chuỗi (string).

export interface SupplierPrice {
  id: number;
  supplier_id: number;
  supplier_name: string | null;
  service_transport_id: number | null;
  service_name: string;
  transport_type: string | null;
  container_name: string;
  loai_hang_hoa: string;
  route_id: number | null;
  route_type: string | null;
  amount: number | string | null;
  amount_next_cont: number | string | null;
  vat: number | string | null;
  currency_code: string | null;
  is_active: boolean;
}

/** Envelope A trả về: { count, results } — proxy B giữ nguyên. */
export interface SupplierPricesResponse {
  count: number;
  results: SupplierPrice[];
}

/** Danh sách bảng giá hiện tại của supplier (chỉ trả về dòng is_active). */
export const getSupplierPrices = (): Promise<SupplierPricesResponse> => {
  return axiosClient2.get('/supplier/prices') as Promise<SupplierPricesResponse>;
};

/**
 * Gửi yêu cầu thay đổi đơn giá (EDIT_AMOUNT).
 * KHÔNG đổi giá ngay — tạo các yêu cầu PENDING chờ duyệt trên hệ thống A.
 */
export const updateSupplierPrices = (
  items: { id: number; amount: number }[],
): Promise<{ created: number; skipped: number[] }> => {
  return axiosClient2.patch('/supplier/prices', { items }) as Promise<{
    created: number;
    skipped: number[];
  }>;
};

export interface ImportSupplierPricesResponse {
  batch_id: string;
  created: number;
  errors: number;
}

/**
 * Upload file Excel giá → tạo batch yêu cầu thay đổi giá PENDING (CREATE/REPLACE)
 * chờ duyệt trên hệ thống A. Proxy: POST /api/supplier/prices/import (multipart).
 */
export const importSupplierPrices = (
  file: File,
  routeType: string,
  currencyId: string | number,
): Promise<ImportSupplierPricesResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('route_type', routeType);
  formData.append('currency_id', String(currencyId));
  return axiosClient2.post('/supplier/prices/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<ImportSupplierPricesResponse>;
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

/**
 * Tra cứu đơn hàng theo booking_bill_number (match exact) cho màn
 * "Quản lý chi hộ". Gọi system B: GET /api/supplier/order-by-booking?q=<value>,
 * proxy sang mhvn. Trả về đơn + các bản ghi Chi hộ thuộc supplier.
 */
export const getOrderByCode = (
  q: string,
): Promise<OrderByCodeResponse> => {
  return axiosClient2.get('/supplier/order-by-booking', {
    params: { q },
  }) as Promise<OrderByCodeResponse>;
};
