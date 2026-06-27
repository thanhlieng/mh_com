import { IContract } from './contract.interface';
import { IManagementStaff } from './management-staff.interface';
import { IPriceList } from './price-list.interface';

export interface ICustomer {
  id?: string;
  customerCode?: string;
  status: string;
  unitId?: string; // Đơn vị
  companyId?: string; // Công ty
  userId?: string;
  fullName: string; // Tên khách hàng
  fullNameEn?: string; // Tên khách hàng tiếng anh
  customerGroup: string; // Nhóm khách hàng Enum ECustomerGroup
  detailAddress: string; // Địa chỉ chi tiết
  detailAddressEn?: string; // Địa chỉ chi tiết tiếng anh
  commune: string; //Xã/Thị trấn
  district: string; //Quận/Huyện
  province: string; //Tỉnh/Thành phố
  country: string; //Quốc gia
  contactPerson: string; // Người liên hệ
  phoneNumber: string; // Điện thoại công ty
  phoneCode: string; // Mã vùng
  mobile: string; // Số di động
  fax?: string; // Số fax
  website?: string; // Website
  email: string;
  typeCustomer: string;
  service: string[];
  type: string;
  postCode?: string;
  state?: string;
  note?: string;
  identifierType: string; // Loại mã định danh Enum EIdentifierType
  identifier: string; // Mã định danh

  // Update info customer 28/11
  // Lương kinh doanh
  beneficiary?: string; // Tên người thụ hưởng
  jobTitle?: string; // Chức vụ làm việc
  beneficiaryPhone?: string; // Số điện thoại người thụ hưởng
  isDirectBeneficiary?: boolean; // Người trực tiếp hưởng hay người thân
  relationshipBeneficiaries?: string; // Quan hệ với người thụ hưởng
  beneficiaryAccountNumber?: string; // Số tài khoản thụ hưởng
  beneficiaryBank?: string; // Ngân hàng thụ hưởng
  lkdRate?: number; // Tỷ lệ LKD/Giá bán gốc chưa phụ phí
  beneficiaryNote?: string; // Ghi chú

  // Tài chính
  typeOfPayment?: string; // Loại thanh toán
  previousCosing?: string; // Kỳ chốt cước
  financeNote?: string; // Ghi chú

  // Thông tin gửi BK
  notifyEmail?: string; //Email BK theo thông tin KH
  notifyOtherEmail?: string; //Gửi BK theo danh sách Email bổ sung thêm ngoài email ban đầu
  notifyContactPerson?: string; // Người liên hệ
  bookingEmail?: string; //Email bảng kê
  bookingPhone?: string; //Số điện thoại
  bookingMobile?: string; //Số di động

  // Thông tin gửi hóa đơn điện tử
  orderEmailCustomer?: string; //Email hóa đơn theo thông tin KH
  orderOtherEmail?: string; // Gửi Hóa đơn theo danh sách Email bổ sung thêm ngoài email ban đầu
  orderContactPerson?: string; // Người liên hệ
  orderEmail?: string; //Email hóa đơn
  orderPhone?: string; //Số di động

  // Thông tin thu nợ
  debtContactPerson?: string; // Người liên hệ
  debtEmail?: string; // Email thu nợ
  debtPhone?: string; // Số điện thoại
  debtMobile?: string; // Số di động
  debtAddress?: string; // Địa chỉ thu nợ

  contract?: IContract[];
  priceList?: IPriceList[];
  management_staff?: IManagementStaff[];
}
