import { BookingEntity } from "src/modules/bookings/entities/bookings.entity";
import { MLExchangeRateEntity } from "src/modules/ml-exchange-rate/entities/ml-exchange-rate.entity";
import { StaffsEntity } from "src/modules/staffs/entities/staffs.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "finance_cpn" })
export class FinanceCPNEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => BookingEntity, (booking) => booking.id)
  @JoinColumn({ name: "booking_id" })
  booking_id: string;

  @OneToOne(() => MLExchangeRateEntity, (item) => item.id)
  @JoinColumn({ name: "exchange_rate_id" })
  exchange_rate_id: string;

  @OneToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: "business_staff_id" })
  @Column({ name: "business_staff_id", nullable: true })
  business_staff_id: string; // sales_staff_are_handle_over - Kinh doanh

  @Column("numeric", { name: "op_billable_weight", nullable: true })
  op_billable_weight: number;

  @Column("numeric", { name: "billable_weight", nullable: true })
  billable_weight: number;

  @Column("numeric", { name: "coefficient_pp_price", nullable: true })
  coefficient_pp_price: number;

  @Column("numeric", { name: "partner_billable_weight", nullable: true })
  partner_billable_weight: number;

  @Column("numeric", { name: "pp1_price", nullable: true })
  pp1_price: number;

  @Column("numeric", { name: "gv_pp1_price", nullable: true })
  gv_pp1_price: number;

  @Column("numeric", { name: "gvg_pp1_price", nullable: true })
  gvg_pp1_price: number;

  @Column("numeric", { name: "pp2_price", nullable: true })
  pp2_price: number;

  @Column("numeric", { name: "gv_pp2_price", nullable: true })
  gv_pp2_price: number;

  @Column("numeric", { name: "gvg_pp2_price", nullable: true })
  gvg_pp2_price: number;

  @Column("numeric", { name: "pp3_price", nullable: true })
  pp3_price: number;

  @Column("numeric", { name: "gv_pp3_price", nullable: true })
  gv_pp3_price: number;

  @Column("numeric", { name: "gvg_pp3_price", nullable: true })
  gvg_pp3_price: number;

  @Column("numeric", { name: "note_pp_price", nullable: true })
  note_pp_price: number;

  @Column({ name: "ncc_pp", nullable: true })
  ncc_pp: string;

  @Column("numeric", { name: "extend_pp_1", nullable: true })
  extend_pp_1: number;

  @Column("numeric", { name: "extend_gv_pp_1", nullable: true })
  extend_gv_pp_1: number;

  @Column("numeric", { name: "extend_gvg_pp_1", nullable: true })
  extend_gvg_pp_1: number;

  @Column("numeric", { name: "extend_pp_2", nullable: true })
  extend_pp_2: number;

  @Column("numeric", { name: "extend_gv_pp_2", nullable: true })
  extend_gv_pp_2: number;

  @Column("numeric", { name: "extend_gvg_pp_2", nullable: true })
  extend_gvg_pp_2: number;

  @Column("numeric", { name: "extend_pp_3", nullable: true })
  extend_pp_3: number;

  @Column("numeric", { name: "extend_gv_pp_3", nullable: true })
  extend_gv_pp_3: number;

  @Column("numeric", { name: "extend_gvg_pp_3", nullable: true })
  extend_gvg_pp_3: number;

  @Column("numeric", { name: "extend_pp_4", nullable: true })
  extend_pp_4: number;

  @Column("numeric", { name: "extend_gv_pp_4", nullable: true })
  extend_gv_pp_4: number;

  @Column("numeric", { name: "extend_gvg_pp_4", nullable: true })
  extend_gvg_pp_4: number;

  @Column("numeric", { name: "extend_pp_5", nullable: true })
  extend_pp_5: number;

  @Column("numeric", { name: "extend_gv_pp_5", nullable: true })
  extend_gv_pp_5: number;

  @Column("numeric", { name: "extend_gvg_pp_5", nullable: true })
  extend_gvg_pp_5: number;

  @Column("numeric", { name: "note_extend_extend_pp", nullable: true })
  note_extend_extend_pp: number;

  @Column({ name: "ncc_co", nullable: true })
  ncc_co: string;

  @Column("numeric", { name: "coefficient_sales_price", nullable: true })
  coefficient_sales_price: number;

  @Column({ name: "ncc_handling", nullable: true })
  ncc_handling: string;

  @Column("numeric", { name: "sales_price", nullable: true })
  sales_price: number;

  @Column("numeric", {
    name: "coefficient_shareholder_equity_price",
    nullable: true,
  })
  coefficient_shareholder_equity_price: number;

  @Column("numeric", { name: "shareholder_equity_price", nullable: true })
  shareholder_equity_price: number;

  @Column("numeric", {
    name: "coefficient_original_cost_price",
    nullable: true,
  })
  coefficient_original_cost_price: number;

  @Column("numeric", { name: "original_cost_price", nullable: true })
  original_cost_price: number;

  @Column("numeric", { name: "original_lkd", nullable: true })
  original_lkd: number;

  @Column("numeric", { name: "lkd_self_calculated", nullable: true })
  lkd_self_calculated: number;

  @Column("numeric", { name: "lkd_sales_price", nullable: true })
  lkd_sales_price: number;

  @Column("numeric", { name: "total_pp_price", nullable: true })
  total_pp_price: number;

  @Column("numeric", { name: "gv_total_pp_price", nullable: true })
  gv_total_pp_price: number;

  @Column("numeric", { name: "gv_origin_total_pp_price", nullable: true })
  gv_origin_total_pp_price: number;

  @Column("numeric", { name: "total_sales_price", nullable: true })
  total_sales_price: number;

  @Column("numeric", { name: "gv_total_sales_price", nullable: true })
  gv_total_sales_price: number;

  @Column("numeric", { name: "gv_origin_sales_price", nullable: true })
  gv_origin_sales_price: number;

  @Column("numeric", { name: "original_ppxd", nullable: true })
  original_ppxd: number;

  @Column("numeric", { name: "ppxd_self_calculated", nullable: true })
  ppxd_self_calculated: number;

  @Column("numeric", { name: "ppxd", nullable: true })
  ppxd: number;

  @Column("numeric", { name: "gv_ppxd", nullable: true })
  gv_ppxd: number;

  @Column("numeric", { name: "gv_origin_ppxd", nullable: true })
  gv_origin_ppxd: number;

  @Column("numeric", { name: "total_extend_pp", nullable: true })
  total_extend_pp: number;

  @Column("numeric", { name: "total_extend_gv_pp", nullable: true })
  total_extend_gv_pp: number;

  @Column("numeric", { name: "total_origin_extend_gv_pp", nullable: true })
  total_origin_extend_gv_pp: number;

  @Column("numeric", { name: "total_sales", nullable: true })
  total_sales: number;

  @Column("numeric", { name: "total_shareholder_equity", nullable: true })
  total_shareholder_equity: number;

  @Column("numeric", { name: "total_origin_gv_acf", nullable: true })
  total_origin_gv_acf: number;

  @Column("numeric", { name: "total_origin_gv_partner", nullable: true })
  total_origin_gv_partner: number;

  @Column("numeric", { name: "diff_origin_gv_acf_partner", nullable: true })
  diff_origin_gv_acf_partner: number;

  @Column("numeric", { name: "total_sales_permanent", nullable: true })
  total_sales_permanent: number;

  @Column("numeric", { name: "ros_sales", nullable: true })
  ros_sales: number;

  @Column("numeric", { name: "total_origin_sales", nullable: true })
  total_origin_sales: number;

  @Column("numeric", { name: "ros", nullable: true })
  ros: number;

  @Column("numeric", { name: "dividend_2_percent", nullable: true })
  dividend_2_percent: number;

  @Column("numeric", { name: "sales_for_business", nullable: true })
  sales_for_business: number;

  @Column("numeric", { name: "bonus", nullable: true })
  bonus: number;

  @Column("numeric", { name: "remaining_profit", nullable: true })
  remaining_profit: number;

  @Column("numeric", { name: "original_vat", nullable: true })
  original_vat: number;

  @Column("numeric", { name: "vat", nullable: true })
  vat: number;

  @Column("numeric", { name: "total_sales_vat", nullable: true })
  total_sales_vat: number;

  @Column("numeric", { name: "original_revenue_before_diff", nullable: true })
  original_revenue_before_diff: number;

  @Column("numeric", { name: "price_diff", nullable: true })
  price_diff: number;

  @Column("numeric", { name: "cost_of_main_ncc", nullable: true })
  cost_of_main_ncc: number;

  @Column("numeric", {
    name: "total_cost_capital_main_type_ncc",
    nullable: true,
  })
  total_cost_capital_main_type_ncc: number;

  @Column({ name: "type_invoice_of_main_ncc", nullable: true })
  type_invoice_of_main_ncc: string;

  @Column({ name: "verified", nullable: true })
  verified: string;

  @Column({ name: "note", nullable: true })
  note: string;

  @Column({ name: "last_sent", nullable: true })
  lastSent: Date;

  @Column({ name: "currency", nullable: true, default: "USD" })
  currency: string;

  @Column({ name: "export_form", nullable: true })
  export_form: string;

  @Column({ name: "price_list_type", nullable: true })
  price_list_type: string;

  @CreateDateColumn()
  created_at: Date;
}
