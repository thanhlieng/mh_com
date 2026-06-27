export const ACCSESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';
export const USER = 'user';

// Multi-target A integration: 1 account mhcom có thể liên kết đồng thời 2 hệ A
// (mhvn + gp). FE lưu loại tài khoản + target đang chọn để gửi header X-A-Target.
export const ACCOUNT_TYPE = 'mhcom_account_type'; // 'supplier' | 'customer'
export const ACTIVE_A_TARGET = 'mhcom_active_target'; // 'mhvn' | 'gp'

// ISO timestamp của lần cuối user mở màn "Báo cáo chất lượng" (tab nhận từ
// MHVN/GP). Dùng để đánh dấu báo cáo mới (created_at > lastSeen) ở sidebar dot
// + badge "Mới" trên hàng. Key tách theo target để chuyển hệ không lẫn dữ liệu.
export const QR_LAST_SEEN_PREFIX = 'mhcom_qr_last_seen:'; // + <target>

