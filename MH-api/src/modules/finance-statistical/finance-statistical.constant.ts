export enum FinanceAndStatisticalErrorMessage {
  FINANCE_STATISTICAL_IS_REQUIRED = 'file báo cáo tài chính là cần thiết. Vui lòng kiểm tra lại',
  INVALID_CPN_FILE = 'File báo cáo của dịch vụ chuyển phát nhanh không đúng format',
  INVALID_FWD_FILE = 'File báo cáo của dịch vụ forwarding không đúng format',
}

export const TemplateCPNFile = [
  'STT',
  'Trạng thái',
  'Loại Giá',
  'Tình trạng',
  'NOTE',
  'Ngày xuất',
  'Số bill gốc', // 6
  'Số bill đối tác',
  'Bill khác',
  'Đối tác',
  'Mã Khách hàng',
  'Tên khách hàng',
  'Khu vực',
  'Kinh doanh', // 13 - business_staff_id
  'Loại gửi',
  'Kí hiệu Nước',
  'Nước gửi',
  'Dịch vụ gửi',
  'Dịch vụ check out',
  'NCC',
  'TTGD Quản lý',
  'Nhóm dịch vụ',
  'TL tính cước', // billable_weight
  'TÍCH', // coefficient_pp_price
  'PP1+/Giá', // pp1_price
  'GV PP1+/Giá', // gv_pp1_price
  'GVG PP1+/Giá', // gvg_pp1_price
  'PP2+/Giá', // pp2_price
  'GV PP2+/Giá', // gv_pp2_price
  'GVG PP2+/Giá', // gvg_pp2_price
  'PP3+/Giá', // pp3_price
  'GV PP3+/Giá', // gv_pp3_price
  'GVG PP3+/Giá', // gvg_pp3_price
  'NOTE', // note_pp_price
  'PP Ngoài 1', // extend_pp_1
  'GV PP Ngoài 1', // extend_gv_pp_1
  'GVG PP Ngoài 1', // extend_gvg_pp_1
  'PP Ngoài 2', // extend_pp_2
  'GV PP Ngoài 2', // extend_gv_pp_2
  'GVG PP Ngoài 2', // extend_gvg_pp_2
  'PP Ngoài 3', // extend_pp_3
  'GV PP Ngoài 3', // extend_gv_pp_3
  'GVG PP Ngoài 3', // extend_gvg_pp_3
  'PP Ngoài 4', // extend_pp_4
  'GV PP Ngoài 4', // extend_gv_pp_4
  'GVG PP Ngoài 4', // extend_gvg_pp_4
  'PP Ngoài 5', // extend_pp_5
  'GV PP Ngoài 5', // extend_gv_pp_5
  'GVG PP Ngoài 5', // extend_gvg_pp_5
  'NOTE', // note_extend_extend_pp
  'TÍCH', // coefficient_sales_price
  'Giá bán\r\nUSD', // sales_price_usd
  'Giá bán\r\nVNĐ', // sales_price_vnd
  'TÍCH', // coefficient_shareholder_equity_price
  'Giá vốn CĐ\r\nUSD', // shareholder_equity_price_usd
  'Giá vốn CĐ\r\nVNĐ', // shareholder_equity_price_vnd
  'TÍCH', // coefficient_original_cost_price
  'Giá vốn Gốc\r\nUSD', // original_cost_price_usd
  'Giá vốn Gốc\r\nVNĐ', // original_cost_price_vnd
  'TÍCH', // original_lkd
  'LKD Tự tính', // lkd_self_calculated
  'LKD/Giá bán\r\nUSD', // lkd_sales_price_usd
  'LKD/Giá bán\r\nVNĐ', // lkd_sales_price_vnd
  'Tổng PP+/Giá\r\nUSD', // total_pp_price_usd
  'Tổng PP+/Giá\r\nVNĐ', // total_pp_price_vnd
  'GV Tổng PP+/Giá\r\nUSD', // gv_total_pp_price_usd
  'GV Tổng PP+/Giá\r\nVNĐ', // gv_total_pp_price_vnd
  'GV Gốc Tổng PP+/Giá\r\nUSD', // gv_origin_total_pp_price_usd
  'GV Gốc Tổng PP+/Giá\r\nVNĐ', // gv_origin_total_pp_price_vnd
  'Tổng giá bán\r\nUSD', // total_sales_price_usd
  'Tổng giá bán\r\nVNĐ', // total_sales_price_vnd
  'GV Tổng giá bán\r\nUSD', // gv_total_sales_price_usd
  'GV Tổng giá bán\r\nVNĐ', // gv_total_sales_price_vnd
  'GV Gốc Tổng giá bán\r\nUSD', // gv_origin_sales_price_usd
  'GV GốcTổng giá bán\r\nVNĐ', // gv_origin_sales_price_vnd
  'TÍCH', // original_ppxd
  'PPXD Tự tính', // ppxd_self_calculated
  'PPXD\r\nUSD', // ppxd_usd
  'PPXD\r\nVNĐ', // ppxd_vnd
  'GV PPXD\r\nUSD', // gv_ppxd_usd
  'GV PPXD\r\nVNĐ', // gv_ppxd_vnd
  'GV Gốc PPXD\r\nUSD', // gv_origin_ppxd_usd
  'GV Gốc PPXD\r\nVNĐ', // gv_origin_ppxd_vnd
  'Tổng PP Ngoài\r\nUSD', // total_extend_pp_usd
  'Tổng PP Ngoài\r\nVNĐ', // total_extend_pp_vnd
  'Tổng GV PP Ngoài\r\nUSD', // total_extend_gv_pp_usd
  'Tổng GV PP Ngoài\r\nVNĐ', // total_extend_gv_pp_vnd
  'Tổng GV Gốc PP Ngoài\r\nUSD', // total_origin_extend_gv_pp_usd
  'Tổng GV Gốc PP Ngoài\r\nVNĐ', // total_origin_extend_gv_pp_vnd
  'Tổng Doanh số\r\nUSD', // total_sales_usd
  'Tổng Gía vốn CĐ\r\nUSD', // total_shareholder_equity_usd
  'Tổng GV Gốc ACF\r\nUSD', // total_origin_gv_acf_usd
  'Tổng GV Gốc Đối tác', // total_origin_gv_partner
  'Chênh lệch GV Gốc\r\nACF - Đối tác', // diff_origin_gv_acf_partner
  'Tổng LN Cố định\r\nUSD', // total_sales_permanent_usd
  'Tỷ suất LN/ DT\r\nof Sales (ROS)', // ros_sales
  'Tổng LN Gốc\r\nUSD', // total_origin_sales_usd
  'Tỷ suất LN/ DT\r\n(ROS)', // ros
  'Tổng Doanh số\r\nVNĐ', // total_sales_vnd
  'Tổng Gía vốn CĐ\r\nVNĐ', // total_shareholder_equity_vnd
  'Tổng GV Gốc ACF\r\nVNĐ', // total_origin_gv_acf_vnd
  'Tổng LN Cố định\r\nVNĐ', // total_sales_permanent_vnd
  'Tổng LN Gốc\r\nVNĐ', // total_origin_sales_vnd
  'Cổ tức 2%\r\nUSD', // dividend_2_percent_usd
  'Cổ tức 2%\r\nVNĐ', // dividend_2_percent_vnd
  'LN Tính cho KD\r\nUSD', // sales_for_business_usd
  'LN Tính cho KD\r\nVNĐ', // sales_for_business_vnd
  'Lương Bonus\r\nUSD', // bonus_usd
  'Lương Bonus\r\nVNĐ', // bonus_vnd
  'LN Còn lại\r\nUSD', // remaining_profit_usd
  'LN Còn lại\r\nVNĐ', // remaining_profit_vnd
  'TÍCH', // original_vat_usd
  'VAT \r\nUSD', // vat_usd
  'Tổng Doanh số Cả VAT\r\nUSD', // total_sales_vat_usd
  'TÍCH', // original_vat_vnd
  'VAT\r\nVNĐ', // vat_vnd
  'Tổng Doanh số Cả VAT\r\nVNĐ', // total_sales_vat_vnd
  'VAT GV Gốc\r\nVNĐ', // origin_vat_gv_vnd
  'Tổng GV Gốc cả VAT\r\nVNĐ', // total_origin_gv_vat_vnd
  'KIÊM TRA', // verified
  'NOTE', // note
];

export const TemplateFWDFile = [
  'STT',
  'Date of booking',
  'Mã khách hàng',
  'Tên khách hàng',
  'Mã đơn hàng',
  'Mã bill MH',
  'Loại dịch vụ',
  'Khoản mục',
  'Giá vốn Gốc USD',
  'VAT Gốc USD',
  'Tổng giá Gốc vốn USD',
  'Giá vốn Gốc VNĐ',
  'VAT Gốc VNĐ',
  'Tổng giá vốn Gốc VNĐ',
  'Giá vốn Cố định USD',
  'VAT Cố định USD',
  'Tổng giá vốn Cố định USD',
  'Giá vốn Cố định VNĐ',
  'VAT Cố định VNĐ',
  'Tổng giá vốn Cố định VNĐ',
  'Giá bán USD',
  'VAT USD',
  'Tổng giá bán USD',
  'Giá bán VNĐ',
  'VAT VNĐ',
  'Tổng giá bán VNĐ',
  'Lương kinh doanh',
  'NCC',
  'Note',
  'Tình trạng đơn hàng',
  'Tình trạng XHĐ',
  'Số hóa đơn',
];
