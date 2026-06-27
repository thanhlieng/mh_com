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
 * Backend: GET /api/supplier/cost-statement/export (MH-api) → proxy sang mhvn
 * `GET /api/mhcom/supplier/transactions/export/`. `from`/`to` map sang
 * `start_date`/`end_date` (PNL lọc theo ngày container, Chi hộ theo invoice_date).
 * Trả file .xlsx (bảng kê cước). Tham số `q` hiện chưa dùng ở export.
 */
export const exportCostStatement = (
  params: CostStatementExportParams,
): Promise<Blob> => {
  return axiosClient2.get('/supplier/cost-statement/export', {
    params,
    responseType: 'blob',
  }) as Promise<Blob>;
};

/**
 * Xuất Báo cáo kê cước & chi hộ (Excel) theo khoảng thời gian.
 * Backend: GET /api/supplier/cost-statement/ke-cuoc-chi-ho/export → proxy sang
 * mhvn `GET /api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/`.
 * `from`/`to` → `start_date`/`end_date` (PNL lọc theo ngày container).
 */
export const exportKeCuocChiHoReport = (
  params: CostStatementExportParams,
): Promise<Blob> => {
  return axiosClient2.get('/supplier/cost-statement/ke-cuoc-chi-ho/export', {
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

// ─── Kê cước & Chi hộ (pivot theo container — tab màn Bảng kê chi phí) ─────────
// Gọi system B: GET /api/supplier/transactions/ke-cuoc-chi-ho → proxy sang A
// `GET /api/mhcom/supplier/ke-cuoc-chi-ho/`. Lọc thời gian theo ngày container.

export interface KeCuocChiHoParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

/**
 * Một dòng Kê cước & Chi hộ — đã pivot theo từng container ở hệ thống A.
 * Các cột nhóm "Cước" kèm `*_pnl_ids` để dựng luồng đề nghị thay đổi
 * (chỉ cho sửa ô có đúng 1 pnl).
 */
export interface KeCuocChiHoRow {
  tt: number;
  ngay: string; // YYYY-MM-DD (ngày container)
  order_id: number | null;
  order_container_id: number | null;
  ma_don_hang: string;
  so_bill_booking: string;
  tuyen: string;
  loai_don_hang: string; // order.order_type (đã localize tiếng Việt)
  so_cont: string;
  loai_cont: string;
  loai_hang: string;
  cang_ha: string; // order.dropoff_terminal.name
  cang_nang: string; // order.pickup_terminal.name
  so_xe: string; // order_container.license_plate
  thang_cong_no: string | null; // order.thang_cong_no (ISO date) — format MM/YYYY
  so_to_khai: string;
  bien_so_xe: string;
  order_completed: boolean;
  // nhóm Cước (editable)
  cuoc: number;
  cuoc_pnl_ids: number[];
  ky_gs: number;
  ky_gs_pnl_ids: number[];
  luu_ca_xe: number;
  luu_ca_xe_pnl_ids: number[];
  lach_huyen: number;
  lach_huyen_pnl_ids: number[];
  phat_sinh: number;
  phat_sinh_pnl_ids: number[];
  tong: number;
  // nhóm Chi hộ về MH
  so_tien_nang_cont_mh: number;
  so_tien_ha_cont_mh: number;
  so_tien_luu_cont_mh: number;
  so_tien_phat_sinh_mh: number;
  tong_chi_ho_mh: number;
  // nhóm Chi hộ về KH
  so_tien_csht_kh: number;
  so_tien_nang_cont_kh: number;
  so_tien_ha_cont_kh: number;
  so_tien_luu_cont_kh: number;
  tong_chi_ho_kh: number;
  // Chi hộ về (theo order.chi_ho_for): 'kh' → "company_name - tax_number - address" của khách hàng; rỗng nếu không xác định.
  chi_ho_ve: string;
  // Số file Chi hộ (do supplier upload từ mhcom) theo trạng thái duyệt — theo ĐƠN.
  file_counts: { approved: number; pending: number; rejected: number };
}

export interface KeCuocChiHoResponse {
  supplier_ids: string[];
  start_date: string;
  end_date: string;
  total: number;
  totals: Record<string, number>;
  results: KeCuocChiHoRow[];
}

export const getSupplierKeCuocChiHo = (
  params: KeCuocChiHoParams = {},
): Promise<KeCuocChiHoResponse> => {
  return axiosClient2.get('/supplier/transactions/ke-cuoc-chi-ho', {
    params,
  }) as Promise<KeCuocChiHoResponse>;
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

/**
 * Base URL của hệ thống mhvn (Django, mhgs_log_be) để build full URL cho file
 * `/media/...`. `/media/` là public, không cần auth → FE có thể mở/tải trực tiếp.
 *
 * Cấu hình qua env `NEXT_PUBLIC_MHGS_HOST` (vd: https://mhvn.example.com).
 * Nếu thiếu env, fallback `''` → trả về path tương đối (chạy được khi mhvn và
 * mhcom cùng domain qua reverse-proxy).
 */
export const MHGS_HOST = process.env.NEXT_PUBLIC_MHGS_HOST ?? '';

/**
 * Build URL tuyệt đối tới file Chi hộ trên hệ thống mhvn để mở/tải trực tiếp
 * (không cần proxy qua MH-api). `fileUrl` lấy từ response API — thường dạng
 * `/media/order_chiho_files/...`. Trả null nếu input rỗng.
 */
export const resolveChiHoFileUrl = (
  fileUrl: string | null | undefined,
): string | null => {
  if (!fileUrl) return null;
  // Đã absolute (http/https) → giữ nguyên.
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${MHGS_HOST}${fileUrl}`;
};

/**
 * Xoá một yêu cầu tải lên file Chi hộ (chỉ cho phép khi file đang PENDING).
 * Backend mhvn enforce ràng buộc supplier + trạng thái.
 */
export const deleteChiHoUpload = (fileId: number | string): Promise<void> => {
  return axiosClient2.delete(
    `/supplier/chiho-files/uploads/${fileId}`,
  ) as Promise<void>;
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
  review_note: string | null;
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

/** Hủy một yêu cầu thay đổi cost đang chờ duyệt (chỉ xóa được khi PENDING) */
export const deleteChangeRequest = (
  id: number | string,
): Promise<void> => {
  return axiosClient2.delete(`/supplier/change-requests/${id}`) as Promise<void>;
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
  reason: string | null;
  review_note: string | null;
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
  service_id: number | null;
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
  /** Thời gian áp dụng giá (ISO datetime). */
  effective_from: string | null;
  /**
   * Số lần price id xuất hiện trong order_container_pnl 3 tháng gần nhất.
   * null nếu service không thuộc nhóm theo dõi (chỉ service_id 4, 24).
   */
  usage_count_3m: number | null;
}

/** Envelope A trả về (phân trang): { count, page, page_size, results }. */
export interface SupplierPricesResponse {
  count: number;
  page: number;
  page_size: number;
  results: SupplierPrice[];
}

export type SupplierPriceSort = 'amount_desc' | 'amount_asc';

export interface SupplierPricesParams {
  page?: number;
  page_size?: number;
  route_id?: number | string;
  service_id?: number | string;
  q?: string;
  /** Lọc theo thời gian áp dụng (YYYY-MM-DD). */
  effective_from?: string;
  effective_to?: string;
  /** Sắp xếp theo đơn giá. Mặc định cao → thấp (amount_desc). */
  sort?: SupplierPriceSort;
}

/** Danh sách bảng giá hiện tại của supplier (phân trang + lọc phía server). */
export const getSupplierPrices = (
  params?: SupplierPricesParams,
): Promise<SupplierPricesResponse> => {
  return axiosClient2.get('/supplier/prices', {
    params: params ?? {},
  }) as Promise<SupplierPricesResponse>;
};

export interface SupplierPriceFilterOptions {
  routes: { id: number; label: string }[];
  services: { id: number; name: string }[];
}

/** Lựa chọn cho bộ lọc (routes + services) — nên cache ở FE. */
export const getSupplierPriceFilterOptions =
  (): Promise<SupplierPriceFilterOptions> => {
    return axiosClient2.get(
      '/supplier/prices/filter-options',
    ) as Promise<SupplierPriceFilterOptions>;
  };

/**
 * Gửi yêu cầu thay đổi đơn giá (EDIT_AMOUNT).
 * KHÔNG đổi giá ngay — tạo các yêu cầu PENDING chờ duyệt trên hệ thống A.
 */
export const updateSupplierPrices = (
  items: { id: number; amount: number; reason?: string }[],
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

/** Một container (dòng con) của đơn — supplier có PNL trên container này. */
export interface OrderContainerRow {
  id: number;
  container_no: string;
  container_kind: string;
  loai_hang_hoa: string;
  declaration_number: string;
  license_plate: string;
  date: string | null;
}

export interface OrderByCodeResponse {
  id: number;
  order_code: string;
  booking_bill_number: string | null;
  bl: string | null;
  created_at: string;
  created_by: string;
  /** Container của đơn mà supplier có PNL — dùng làm dòng con để upload theo container. */
  containers?: OrderContainerRow[];
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
