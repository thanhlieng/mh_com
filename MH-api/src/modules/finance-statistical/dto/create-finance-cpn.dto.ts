import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFinanceCPNDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  booking_id: string = '';

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  currency: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  exchange_rate_id: string;
  
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  op_billable_weight: number = 0; // Điều chỉnh TL Tính cước

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  billable_weight: number = 0; // TL tính cước

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  partner_billable_weight: number = 0; // TL Đối tác chốt

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  pp1_price: number = 0; // PP1+/Giá

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_pp1_price: number = 0; // GV PP1+/Giá

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gvg_pp1_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  pp2_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_pp2_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gvg_pp2_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  pp3_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_pp3_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gvg_pp3_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ncc_pp: string = ''; // NCC PP Gom, Delivery, Trucking, Kết nối...

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_pp_1: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gv_pp_1: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gvg_pp_1: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_pp_2: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gv_pp_2: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gvg_pp_2: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_pp_3: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gv_pp_3: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gvg_pp_3: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_pp_4: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gv_pp_4: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gvg_pp_4: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_pp_5: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gv_pp_5: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  extend_gvg_pp_5: number = 0;

  @ApiProperty()
  @IsOptional()
  ncc_co: string = ''; // NCC Tờ khai, CO...

  @ApiProperty()
  @IsOptional()
  ncc_handling: string = ''; // NCC Handling, Khác...

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sales_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sales_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  coefficient_shareholder_equity_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  shareholder_equity_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  shareholder_equity_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  coefficient_original_cost_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  original_cost_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  original_cost_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  original_lkd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  lkd_self_calculated: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  lkd_sales_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  lkd_sales_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_pp_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_pp_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_total_pp_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_total_pp_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_origin_total_pp_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_origin_total_pp_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_total_sales_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_total_sales_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_origin_sales_price: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_origin_sales_price_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  original_ppxd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ppxd_self_calculated: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ppxd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ppxd_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_ppxd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_ppxd_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_origin_ppxd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  gv_origin_ppxd_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_extend_pp: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_extend_pp_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_extend_gv_pp: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_extend_gv_pp_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_extend_gv_pp: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_extend_gv_pp_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_shareholder_equity: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_gv_acf: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_gv_partner: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  diff_origin_gv_acf_partner: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales_permanent: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ros_sales: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_sales: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ros: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_shareholder_equity_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_gv_acf_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales_permanent_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_origin_sales_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  dividend_2_percent: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  dividend_2_percent_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sales_for_business: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sales_for_business_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bonus: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bonus_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  remaining_profit: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  remaining_profit_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  original_vat: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  vat: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_sales_vat: number = 0;

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // original_vat_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  original_revenue_before_diff: number = 0; // Doanh thu trước chênh lệch

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // vat_vnd: number = 0; 

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  price_diff: number = 0; // SỐ TIỀN CHÊNH GIÁ

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // total_sales_vat_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  cost_of_main_ncc: number = 0; // GIÁ VỐN THEO NCC CHÍNH

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // origin_vat_gv_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  total_cost_capital_main_type_ncc: number = 0; // TỔNG GIÁ VỐN THEO LOẠI TIỀN NCC CHÍNH

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // total_origin_gv_vat_vnd: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  type_invoice_of_main_ncc: string = ''; // LOẠI XUẤT HÓA ĐƠN CỦA NCC CHÍNH

  @ApiProperty()
  @IsString()
  @IsOptional()
  verified: string = '';

  @ApiProperty()
  @IsOptional()
  note: string = '';

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  business_staff_id: string = '';
  
  export_form: string; // Hình thức xuất
  
  price_list_type: string; // Loại bảng giá
}
