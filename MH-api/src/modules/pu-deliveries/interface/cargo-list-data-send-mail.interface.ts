export interface IBookingCargoList {
  index: number;
  created_at: string;
  booking_code: string;
  reference_code: string;
  sender_name: string; // Công ty gửi
  sender_contact_person: string; // Người gửi
  receiver_name: string; // cong ty nhan
  receiver_contact_person: string; // Người nhận
  customs_declaration_number: string; // Số tờ khai
  destination: string; // Nơi đến
  booking_type: string; // Loại hàng
  weight: number; // Trọng lượng
  fare: number; // Tiền cước
  surcharge: number; // Phụ phí xăng dầu
  other_surcharge: number; // Phụ phí khác
  total: number; // Tổng tiền
  secondary_currency_total: number; // Tổng tiền
  total_pp_price: number // Phụ phí
}

export interface ICargoListDataSendMail {
  month: number;
  year: number;
  time_and_address: string; // Hà Nội, ngày 26 tháng 6 năm 2023
  customer_name: string;
  customer_address: string;
  customer_contact_name: string;
  phone_number: string;
  tax_number: string;
  email: string[];
  customer_code: string;
  date_now: string; // 25/6/2023
  currency: string;
  secondary_currency: string;
  exchange_rate: string;
  total_service_fee_first: string;
  tax_fee_first: string;
  total_pay_first: string;
  total_service_fee_second: string;
  tax_fee_second: string;
  total_pay_second: string;

  bookings: IBookingCargoList[];
  booking_data: string;
}
