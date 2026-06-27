import { EPartnerServiceKey } from '@constants/common.constants';

export enum EModulePermissionName {
  BOOKING = 'Đơn hàng',
  OPERATE = 'Vận hành',
  CUSTOMER = 'Khách hàng',
  ROLE = 'Vai trò',
  STAFF = 'Nhân viên',
  TRACKING_CHECKPOINT = 'Checkpoint',
  CATEGORY = 'Danh mục master',
  MANAGE_HOMEPAGE = 'Quản lý trang chủ',
  CARGO_LIST = 'Bảng kê',
  FINANCE_STATISTICAL = 'Báo cáo - Thống kê',
  MANAGE_MANIFEST = 'Quản lý Manifest',
  HISTORY = 'History',
}

export enum EPermissionActionKey {
  IMPORT_BOOKING = 'import_booking',
  ASSIGNEE_BOOKING = 'assignee_booking',
  GET_LIST_MY_ASSIGNEE_BOOKING = 'get_list_my_assignee_booking',
  GET_ALL_LIST_MY_ASSIGNEE_BOOKING = 'get_all_list_my_assignee_booking',
  GET_LIST_BOOKING = 'get_list_booking',
  GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF = 'get_list_booking_for_customer_management_staff',
  GET_BOOKING_DETAIL = 'get_booking_detail',
  CONFIRM_HANDLE_BOOKING = 'confirm_handle_booking',
  UPDATE_BOOKING = 'update_booking',

  // Connect bill (manifest)
  MANAGE_MANIFEST = 'manage_manifest',

  // Operate
  MANAGE_OPERATE = 'manage_operate',

  // Pickup
  MANAGE_PICK_UP = 'manage_pick_up',
  MANAGE_PICK_UP_ALL = 'manage_pick_up_all',
  
  // Customer
  CREATE_CUSTOMER = 'create_customer',
  GET_LIST_CUSTOMER = 'get_list_customer',
  GET_ALL_LIST_CUSTOMER = 'get_all_list_customer',
  GET_CUSTOMER_DETAIL = 'get_customer_detail',
  GET_PRIVATE_INFORMATION_CUSTOMER = 'get_private_informaion_customer',
  UPDATE_CUSTOMER = 'update_customer',

  // Role
  CREATE_ROLE = 'create_role',
  GET_LIST_ROLE = 'get_list_role',
  GET_ROLE_DETAIL = 'get_role_detail',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'remove_role',
  RESET_PASSWORD = 'reset_password',

  // Staff
  CREATE_STAFF = 'create_staff',
  GET_LIST_STAFF = 'get_list_staff',
  GET_STAFF_DETAIL = 'get_staff_detail',
  UPDATE_STAFF = 'update_staff',

  // manage tracking
  MANAGE_TRACKING_CHECKPOINT = 'manage_tracking_checkpoint',

  // CATEGORY
  MANAGE_CATEGORY = 'manage_category',

  // MANAGE_HOMEPAGE
  MANAGE_HOMEPAGE = 'manage_homepage',

  // CARGO LIST
  IMPORT_CARGO_LIST = 'import_cargo_list',
  GET_CARGO_LIST = 'get_cargo_list',

  // FINANCE AND STATISTICAL
  IMPORT_STATISTICAL_FILE = 'import_statistical_file',
  STATISTICAL_BY_STAFF = 'statistical_by_staff',
  REPORT_FOR_ACCOUNTING = 'report_for_accounting',
  STATISTICAL_BY_SERVICE = 'statistical_by_service',
  STATISTICAL_BY_CUSTOMER = 'statistical_by_customer',
  STATISTICAL_REVENUE_BY_CUSTOMER = 'statistical_revenue_by_customer',

  // MANAGE_MANIFEST
  MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER = 'manage_manifest_yamato_southern_for_partner',
  MANAGE_MANIFEST_YAMATO_NORTH_PARTNER = 'manage_manifest_yamato_north_for_partner',
  MANAGE_MANIFEST_YAMATO_SOUTHERN = 'manage_manifest_yamato_southern',
  MANAGE_MANIFEST_YAMATO_NORTH = 'manage_manifest_yamato_north',
  MANAGE_MANIFEST_K_CARGO = 'manage_manifest_k_cargo',
  MANAGE_MANIFEST_K_CARGO_PARTNER = 'manage_manifest_k_cargo_partner',

  // History
  MANAGE_HISTORY = 'manage_history',
}

export const EPermissionKeyToServiceKey = {
  [EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER]: EPartnerServiceKey.YAMATO_SOUTHERN,
  [EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER]: EPartnerServiceKey.YAMATO,
  [EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN]: EPartnerServiceKey.YAMATO_SOUTHERN,
  [EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH]: EPartnerServiceKey.YAMATO,
  [EPermissionActionKey.MANAGE_MANIFEST_K_CARGO]: EPartnerServiceKey.K_CARGO,
  [EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER]: EPartnerServiceKey.K_CARGO,
};

export enum EPermissionDescription {
  // Booking //
  IMPORT_BOOKING = 'Import booking (Đơn hàng)',
  ASSIGNEE_BOOKING = 'Phân phối đơn hàng',
  GET_LIST_MY_ASSIGNEE_BOOKING = 'Đơn hàng chờ lấy hàng',
  GET_ALL_LIST_MY_ASSIGNEE_BOOKING = 'Đơn hàng chờ lấy hàng của tất cả nhân viên',
  GET_LIST_BOOKING = 'Lấy danh sách đơn hàng',
  GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF = 'Lấy danh sách đơn hàng cho nhân viên quản lý khách hàng',
  GET_BOOKING_DETAIL = 'Xem chi tiết thông tin đơn hàng',
  CONFIRM_HANDLE_BOOKING = 'Xác nhận đơn hàng đã xử lý (Đồng bộ tracking với AfterShip)',
  UPDATE_BOOKING = 'Cập nhật thông tin booking',

  // Connect bill (manifest)
  MANAGE_MANIFEST = 'Quản lý, xuất file manifest (Sau bước vận hành)',

  // Operate
  MANAGE_OPERATE = 'Quản lý vận hành đơn hàng trước khi chuyển sang manifest',

  // Pickup
  MANAGE_PICK_UP = 'Quản lý đơn hàng đang pickup của shipper',
  MANAGE_PICK_UP_ALL = 'Quản lý đơn hàng đã pickup của tất cả shipper',

  // Customer
  CREATE_CUSTOMER = 'Tạo mới thông tin khách hàng',
  GET_LIST_CUSTOMER = 'Lấy thông tin danh sách khách hàng',
  GET_ALL_LIST_CUSTOMER = 'Xem toàn bộ thông tin khách hàng',
  GET_CUSTOMER_DETAIL = 'Lấy thông tin chi tiết khách hàng',
  GET_PRIVATE_INFORMATION_CUSTOMER = 'Lấy thông tin bí mật của khách hàng',
  UPDATE_CUSTOMER = 'Cập nhật thông tin khách hàng',

  // Role
  CREATE_ROLE = 'Tạo vai trò',
  GET_LIST_ROLE = 'Lấy danh sách vai trò',
  GET_ROLE_DETAIL = 'Lấy thông tin chi tiết một vai trò',
  UPDATE_ROLE = 'Cập nhật thông tin vai trò',
  DELETE_ROLE = 'Xóa vai trò',
  RESET_PASSWORD = 'Đặt lại mật khẩu',

  // Staff
  CREATE_STAFF = 'Tạo thông tin nhân viên',
  GET_LIST_STAFF = 'Lấy danh sách thông tin nhân viên',
  GET_STAFF_DETAIL = 'Lấy thông tin chi tiết nhân viên',
  UPDATE_STAFF = 'Cập nhật thông tin nhân viên',

  // manage tracking
  MANAGE_TRACKING_CHECKPOINT = 'Quản lý tracking, checkpoint (Check point)',

  // CATEGORY
  MANAGE_CATEGORY = 'Quản lý chung danh mục',

  // MANAGE_HOMEPAGE
  MANAGE_HOMEPAGE = 'Quản lý trang chủ (Bài viết, danh mục bài viết...)',

  // CARGO LIST
  IMPORT_CARGO_LIST = 'Import file bảng kê',
  GET_CARGO_LIST = 'Lấy danh sách bảng kê',

  // FINANCE AND STATISTICAL
  REPORT_FOR_ACCOUNTING = 'Xuất toàn bộ dữ liệu cho quản lý và kế toán',
  IMPORT_STATISTICAL_FILE = 'Import file báo cáo - thông kê',
  STATISTICAL_BY_STAFF = 'Báo cáo chi tiết Doanh thu - Giá vốn',
  STATISTICAL_BY_SERVICE = 'Báo cáo theo Dịch vụ',
  STATISTICAL_BY_CUSTOMER = 'Report theo KH và KD',
  STATISTICAL_REVENUE_BY_CUSTOMER = 'Report KH Không vào mạng và gửi giảm',

  // MANAGE_MANIFEST
  MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER = 'Xử lý Manifest Yamato miền Nam (Đối tác)',
  MANAGE_MANIFEST_YAMATO_NORTH_PARTNER = 'Xử lý Manifest Yamato miền Bắc (Đối tác)',
  MANAGE_MANIFEST_YAMATO_SOUTHERN = 'Xử lý Manifest Yamato miền Nam',
  MANAGE_MANIFEST_YAMATO_NORTH = 'Xử lý Manifest Yamato miền Bắc',
  MANAGE_MANIFEST_K_CARGO = 'Xử lý Manifest K-Cargo (Đối tác)',
  MANAGE_MANIFEST_K_CARGO_PARTNER = 'Xử lý Manifest K-Cargo',

  // History
  MANAGE_HISTORY = 'Truy vết',
}
