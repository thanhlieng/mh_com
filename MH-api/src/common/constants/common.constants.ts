export const DefaultTimezone = 'Asia/Ho_Chi_Minh';

export enum CommonError {
  NOT_FOUND_USER = 'Tài khoản không tồn tại',
  NOT_FOUND_CUSTOMER = 'Không tìm thấy khách hàng',
  NOT_FOUND_STAFF = 'Không tìm thấy thông tin nhân viên',
  PASSWORD_NOT_MATCH = 'Mật khẩu không khớp',
  WRONG_PASSWORD = 'Sai mật khẩu',
  CAN_NOT_CHANGE_STATUS_BOOKING = `Can't change status booking. Please check again !`,
  USER_ALREADY_EXIST = 'User already exist',
  TOKEN_NOT_FOUND = 'Token not found',
  BAD_ESTIMATE_DATE = 'Vui lòng chọn ngày và giờ giao hàng sau thời gian hiện tại',
  BOOKING_NOT_HAVE_INVOICE = 'Booking not have invoice',
  BOOKING_NOT_HAVE_PARTNER_BILL = 'Booking not have partner bill',
  VIRTUAL_DELIVERY_ADDRESS_NOT_ENOUGHT = 'Virtual delivery address not enought.',
  BOOKING_CREATED_SMALL_BOOKING = 'This booking has created a small booking',
  BOOKING_NOT_HAVE_SMALL_BOOKING = 'Booking not have small booking',
  NOT_FOUND_PARTNER_SERVICE = 'Not found partner service',
  ADDRESS_BOOK_NOT_FOUND = 'Address book not found',
  REMOVE_ADDRESS_BOOK_FAIL = `Cann't remove this address because it's not exists or this address is default`,
  PICKUP_HAS_BEEN_PICKED_UP = 'Đơn hàng đã được pickup',
  ROLE_DEFAULT_CAN_NOT_REMOVE = 'This role is default can not remove it',
  ROLE_DEFAULT_CAN_NOT_UPDATE = 'This role is default can not update it',
  ROLE_ALREADY_USE_CAN_NOT_REMOVE = 'Role này đã được sử dụng nên không được xóa',
  BOOKING_NOT_FOUND = 'Đơn hàng không tồn tại',
  PARTNER_SERVICE_NOT_FOUND = 'Dịch vụ đối tác không tồn tại',
  BOOKING_CONFIRMED = 'Đơn hàng của bạn đã được xác nhận',
  TRACKING_EXISTS = 'Thông tin tracking đã tồn tại',
  PARTNER_BILL_CODE_ALREADY_EXISTS = 'Mã bill đối tác đã tồn tại',
  GOOGLE_SHEET_LINK_ERROR = 'Google sheet link error. Please contact to admin',
  SERVICE_BOOKING_NOT_EXISTS = 'Vui lòng chọn lại dịch vụ! (Dịch vụ hiện tại không tồn tại hoặc bạn không có quyền)',
  BOOKING_WITHOUT_PACKAGES = 'Đơn hàng không có kiện hàng. Vui lòng kiểm tra lại',
  BOOKING_NOT_HAVE_DELIVERY_INFORMATION = 'Đơn hàng không có thông tin vận chuyển vui lòng kiểm tra lại!',
  BOOKING_SPLITED = 'Đơn hàng này đã thực hiện chia đơn',
  THIS_BOOKING_CAN_NOT_SPLIT = 'Đơn hàng này không thể thực hiện chia đơn hàng vì đơn hàng này là đơn con của một đơn hàng khác',
  BOOKING_NOT_HAVE_SPLIT_BILL = 'Đơn hàng không có đơn tách vui lòng kiểm tra lại',
  PARTNER_BILL_NOT_YET_CONFIG = 'Dịch vụ đối tác này không tồn tại template in bill vui lòng kiểu tra lại',
  TEMPLATE_INVOICE_NOT_FOUND = 'Mẫu invoice không tồn tại vui lòng liên hệ với admin',
}

export enum CommonSuccess {
  SET_DEFAULT_ADDRESS_BOOK_SUCCESSFULLY = 'Set default address book successfully',
  REMOVE_ADDRESS_SUCCESSFULLY = 'Remove address book successfully',
  UPDATE_ADDRESS_SUCCESSFULLY = 'Update address book successfully',
}

export enum CommonResponse {
  SUCCESS = 'Success',
  CREATE = 'Created',
  ERROR = 'Error',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DefaultPagination {
  PAGE = 1,
  PAGE_SIZE = 10,
}

export enum Marital { // Tình trạng hôn nhân
  SINGLE = 'Single',
  MARRIRED = 'Marrired',
}

export enum MaritalMessage { // Tình trạng hôn nhân
  SINGLE = 'Độc thân',
  MARRIRED = 'Đã kết hôn',
}

export enum BookingStatus {
  NOT_YET_HANDED_OVER = 'NOT_YET_HANDED_OVER', // Chưa bàn giao
  HANDED_OVER = 'HANDED_OVER', // Đã bàn giao
  DONE = 'DONE', // Đã lấy hàng
  CANCEL = 'CANCEL', // Đã hủy

  // for filter
  NOT_DELIVERED_YET = 'NOT_DELIVERED_YET', // Chưa phát hàng
  DELIVERED = 'DELIVERED', // Đã phát hàng
}

export enum EBookingStatusMessage {
  NOT_YET_HANDED_OVER = 'Chưa bàn giao',
  HANDED_OVER = 'Đã bàn giao',
  DONE = 'Đã lấy hàng',
  CANCEL = 'Đã hủy',

  NOT_DELIVERED_YET = 'Chưa phát hàng',
  DELIVERED = 'Đã phát hàng',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum LevelStaff { // Trình độ nhân viên
  MASTER = 'MASTER', // Thạc sĩ
  UNIVERSITY = 'UNIVERSITY', // Đại học
  COLLEGE = 'COLLEGE', // Cao đẳng
  INTERMEDIATE = 'INTERMEDIATE', // Trung cấp
  HIGH_SCHOOL = 'HIGH_SCHOOL', // Trung học phổ thông
  FREELANCE_WORKERS = 'FREELANCE_WORKERS', // Lao động tự do
}

export enum LevelStaffMessage { // Trình độ nhân viên
  MASTER = 'Thạc sĩ', // Thạc sĩ
  UNIVERSITY = 'Đại học', // Đại học
  COLLEGE = 'Cao đẳng', // Cao đẳng
  INTERMEDIATE = 'Trung cấp', // Trung cấp
  HIGH_SCHOOL = 'Trung học phổ thông', // Trung học phổ thông
  FREELANCE_WORKERS = 'Lao động tự do', // Lao động tự do
}

export enum CommoditiesType { // Loại hàng hóa
  LICENSE = 'LICENSE', //Chứng từ
  GARMENT = 'GARMENT', //May mặc
  MACHANICAL = 'MACHANICAL', // Cơ khí
  ELECTRONIC_COMPONENTS = 'ELECTRONIC_COMPONENTS', //Linh kiện điện tử
  PLASTIC_RUBBER = 'PLASTIC_RUBBER', //Nhựa, cao su
  FOOD = 'FOOD', // Thực phẩm
  OTHER = 'OTHER', //Khác
}

export enum BookingType {
  LICENSE = 'LICENSE', //Chứng từ,
  COMMODITY = 'COMMODITY', //Hàng hóa,
}

export enum ServiceEnum { // Dịch vụ sử dụng
  EXPORT_SERVICE_EXPRESS = 'EXPORT_SERVICE_EXPRESS', //'Dịch vụ hàng xuất Chuyển phát nhanh',
  IMPORT_SERVICE_EXPRESS = 'IMPORT_SERVICE_EXPRESS', //'Dịch vụ hàng nhập Chuyển phát nhanh',
  AIR_CARGO_SERVICE = 'AIR_CARGO_SERVICE', //'Dịch vụ Air Cargo (Hàng không quốc tế)',
  FORWARDING_SERVICE = 'FORWARDING_SERVICE', //'Dịch vụ Forwarding (Vận tải quốc tế)',
  CUSTOMS_CLEARANCE_SERVICE = 'CUSTOMS_CLEARANCE_SERVICE', //'Dịch vụ Thông quan hải quan',
  TRUCKING_SERVICE = 'TRUCKING_SERVICE', //'Dịch vụ Trucking trong nước',
  ECOMMERCE_SERVICE = 'ECOMMERCE_SERVICE', //'Dịch vụ Thương mại điện tử',
  DOMESTIC_SERVICE = 'DOMESTIC_SERVICE', //'Dịch vụ Nội địa',
  ORTHER_SERVICE = 'ORTHER_SERVICE', //'Dịch vụ khác',
}

export enum CustomerType { // Loại khách hàng
  DOMESTIC_COMPANY = 'DOMESTIC_COMPANY', //'Doanh nghiệp trong nước',
  FOREIGN_JOINT_VENTURE_ENTERPRISE = 'FOREIGN_JOINT_VENTURE_ENTERPRISE', //'Doanh nghiệp liên doanh nước ngoài',
  ENTERPRISES_FOREIGN_CAPITAL = 'ENTERPRISES_FOREIGN_CAPITAL', //'Doanh nghiệp 100% vốn nước ngoài',
  PRIVATE_ENTERPRISE = 'PRIVATE_ENTERPRISE', //'Doanh nghiệp tư nhân, hộ cá thể',
  STATE_ENTERPRISES = 'STATE_ENTERPRISES', //'Doanh nghiệp nhà nước',
  REPRESENTATIVE_OFFICE = 'REPRESENTATIVE_OFFICE', //'Văn phòng đại diện',
  INDIVIDUAL_CUSTOMER = 'INDIVIDUAL_CUSTOMER', //'Khách hàng cá nhân',
}

export enum NetWorkCustomerType { // Loại khách hàng vào mạng
  REGULAR_CUSTOMER = 'REGULAR_CUSTOMER', //'Khách hàng thường xuyên',
  LOT_CUSTOMER = 'LOT_CUSTOMER', //'Khách hàng lô',
  RETAIL_CUSTOMER = 'RETAIL_CUSTOMER', //'Khách hàng lẻ',
  TRIAL_CUSTOMER = 'TRIAL_CUSTOMER', //'Khách hàng dùng thử',
}
// delivery conditions
export enum DeliveryConditions { // Điều kiện giao hàng
  EX_WORKS = 'EX_WORKS', // Giao tại xưởng
  FREE_CARRIER = 'FREE_CARRIER', //Giao cho người chuyên chở
  CARRIAGE_PAID_TO = 'CARRIAGE_PAID_TO', // Cước phí trả tới
  CARRIAGE_AND_INSURANCE_PAID_TO = 'CARRIAGE_AND_INSURANCE_PAID_TO', // Cước phí và bảo hiểm trả tới
  DELIVERED_AT_TERMINAL = 'DELIVERED_AT_TERMINAL', // Giao tại bến
  DELIVERED_AT_PLACE = 'DELIVERED_AT_PLACE', // Giao tại nơi đến
  DELIVERED_DUTY_PAID = 'DELIVERED_DUTY_PAID', // Giao hàng đã nộp thuế
  FREE_ALONGSIDE_SHIP = 'FREE_ALONGSIDE_SHIP', // Giao tại mạn tàu
  FREE_ON_BOARD = 'FREE_ON_BOARD', // Giao lên tàu
  COST_AND_FREIGHT = 'COST_AND_FREIGHT', // Tiền hàng và cước phí
  COST_INSURANCE_AND_FREIGHT = 'COST_INSURANCE_AND_FREIGHT', // Tiền hàng, bảo hiểm và cước phí
}

export enum TypeOfPayment {
  PREPAID = 'PREPAID', //Thanh toán tại Việt Nam
  COLLECT_CHARGE = 'COLLECT_CHARGE', // Thanh toán tại nước nhận theo order từ đầu nước ngoài
  TELEGRAPHIC_TRANSFER_REMITTANCE = 'TELEGRAPHIC_TRANSFER_REMITTANCE', // Chuyển tiền bằng Điện chuyển tiền
  MAIL_TRANSFER_REMITTANCE = 'MAIL_TRANSFER_REMITTANCE', // Chuyển tiền bằng Thư chuyển tiền
  CASH_AGAINST_DOCUMENT = 'CASH_AGAINST_DOCUMENT', // Trả tiền lấy chứng từ
  COLLECTION = 'COLLECTION', // Nhờ thu
  LETTER_OF_CREDIT = 'LETTER_OF_CREDIT', // Tín dụng thư
}

// Đơn vị Tiền tệ
export enum CurrencyUnit {
  VND = 'VND', // Đồng Việt Nam
  USD = 'USD', // Đô la Mỹ
  JSP = 'JSP', // Yên Nhật
  CAD = 'CAD', // Đô la Canada
  EUR = 'EUR', // Đông Euro
  GBP = 'GBP', // Bảng Anh
  SGD = 'SGD', // Đô la Singapor
  WON = 'WON', // Won Hàn
}

export enum CalculationUnit {
  CM_KG = 'CM_KG',
  CBM = 'CBM',
  CONT = 'CONT',
}

export enum UnitOfMeasure {
  Set = 'Set',
  Piece = 'Piece',
  Pcs = 'Pcs',
  Met = 'Met',
  Roll = 'Roll',
  Box = 'Box',
  Bottle = 'Bottle',
  Pair = 'Pair',
}

export const defaultNameLength = 30;

export const commonRadix = 10;

export enum PermissionActions {
  UserManagementFeatureAccess = 'UserManagementFeature_Access',
  UserManagementFeatureCreate = 'UserManagementFeature_Create',
  UserManagementFeatureUpdate = 'UserManagementFeature_Update',
  UserManagementFeatureDelete = 'UserManagementFeature_Delete',
  RolePermissionManagementFeatureAccess = 'RolePermissionManagementFeature_Access',
  RolePermissionManagementFeatureCreate = 'RolePermissionManagementFeature_Create',
  RolePermissionManagementFeatureUpdate = 'RolePermissionManagementFeature_Update',
  RolePermissionManagementFeatureDelete = 'RolePermissionManagementFeature_Delete',
  OrderManagementFeatureAccess = 'OrderManagementFeature_Access',
  OrderManagementFeatureCreate = 'OrderManagementFeature_Create',
  OrderManagementFeatureUpdate = 'OrderManagementFeature_Update',
  OrderManagementFeatureDelete = 'OrderManagementFeature_Delete',
}

export enum InvoiceItemType {
  CommercialGoods = 'Commercial_Goods', //hàng hoá mậu dịch,
  NonCommercialGoods = 'Non_Commercial_Goods', //Hàng hóa phi mậu dịch,
}

export enum InvoiceType {
  NonCommercialInvoice = 'Non_Commercial_Invoice',
  CommercialInvoice = 'Commercial_Invoice',
}

export const countries = [
  { value: 'Afghanistan', key: 'AF' },
  { value: 'Åland Islands', key: 'AX' },
  { value: 'Albania', key: 'AL' },
  { value: 'Algeria', key: 'DZ' },
  { value: 'American Samoa', key: 'AS' },
  { value: 'AndorrA', key: 'AD' },
  { value: 'Angola', key: 'AO' },
  { value: 'Anguilla', key: 'AI' },
  { value: 'Antarctica', key: 'AQ' },
  { value: 'Antigua and Barbuda', key: 'AG' },
  { value: 'Argentina', key: 'AR' },
  { value: 'Armenia', key: 'AM' },
  { value: 'Aruba', key: 'AW' },
  { value: 'Australia', key: 'AU' },
  { value: 'Austria', key: 'AT' },
  { value: 'Azerbaijan', key: 'AZ' },
  { value: 'Bahamas', key: 'BS' },
  { value: 'Bahrain', key: 'BH' },
  { value: 'Bangladesh', key: 'BD' },
  { value: 'Barbados', key: 'BB' },
  { value: 'Belarus', key: 'BY' },
  { value: 'Belgium', key: 'BE' },
  { value: 'Belize', key: 'BZ' },
  { value: 'Benin', key: 'BJ' },
  { value: 'Bermuda', key: 'BM' },
  { value: 'Bhutan', key: 'BT' },
  { value: 'Bolivia', key: 'BO' },
  { value: 'Bosnia and Herzegovina', key: 'BA' },
  { value: 'Botswana', key: 'BW' },
  { value: 'Bouvet Island', key: 'BV' },
  { value: 'Brazil', key: 'BR' },
  { value: 'British Indian Ocean Territory', key: 'IO' },
  { value: 'Brunei Darussalam', key: 'BN' },
  { value: 'Bulgaria', key: 'BG' },
  { value: 'Burkina Faso', key: 'BF' },
  { value: 'Burundi', key: 'BI' },
  { value: 'Cambodia', key: 'KH' },
  { value: 'Cameroon', key: 'CM' },
  { value: 'Canada', key: 'CA' },
  { value: 'Cape Verde', key: 'CV' },
  { value: 'Cayman Islands', key: 'KY' },
  { value: 'Central African Republic', key: 'CF' },
  { value: 'Chad', key: 'TD' },
  { value: 'Chile', key: 'CL' },
  { value: 'China', key: 'CN' },
  { value: 'Christmas Island', key: 'CX' },
  { value: 'Cocos (Keeling) Islands', key: 'CC' },
  { value: 'Colombia', key: 'CO' },
  { value: 'Comoros', key: 'KM' },
  { value: 'Congo', key: 'CG' },
  { value: 'Congo, The Democratic Republic of the', key: 'CD' },
  { value: 'Cook Islands', key: 'CK' },
  { value: 'Costa Rica', key: 'CR' },
  { value: "Cote D'Ivoire", key: 'CI' },
  { value: 'Croatia', key: 'HR' },
  { value: 'Cuba', key: 'CU' },
  { value: 'Cyprus', key: 'CY' },
  { value: 'Czech Republic', key: 'CZ' },
  { value: 'Denmark', key: 'DK' },
  { value: 'Djibouti', key: 'DJ' },
  { value: 'Dominica', key: 'DM' },
  { value: 'Dominican Republic', key: 'DO' },
  { value: 'Ecuador', key: 'EC' },
  { value: 'Egypt', key: 'EG' },
  { value: 'El Salvador', key: 'SV' },
  { value: 'Equatorial Guinea', key: 'GQ' },
  { value: 'Eritrea', key: 'ER' },
  { value: 'Estonia', key: 'EE' },
  { value: 'Ethiopia', key: 'ET' },
  { value: 'Falkland Islands (Malvinas)', key: 'FK' },
  { value: 'Faroe Islands', key: 'FO' },
  { value: 'Fiji', key: 'FJ' },
  { value: 'Finland', key: 'FI' },
  { value: 'France', key: 'FR' },
  { value: 'French Guiana', key: 'GF' },
  { value: 'French Polynesia', key: 'PF' },
  { value: 'French Southern Territories', key: 'TF' },
  { value: 'Gabon', key: 'GA' },
  { value: 'Gambia', key: 'GM' },
  { value: 'Georgia', key: 'GE' },
  { value: 'Germany', key: 'DE' },
  { value: 'Ghana', key: 'GH' },
  { value: 'Gibraltar', key: 'GI' },
  { value: 'Greece', key: 'GR' },
  { value: 'Greenland', key: 'GL' },
  { value: 'Grenada', key: 'GD' },
  { value: 'Guadeloupe', key: 'GP' },
  { value: 'Guam', key: 'GU' },
  { value: 'Guatemala', key: 'GT' },
  { value: 'Guernsey', key: 'GG' },
  { value: 'Guinea', key: 'GN' },
  { value: 'Guinea-Bissau', key: 'GW' },
  { value: 'Guyana', key: 'GY' },
  { value: 'Haiti', key: 'HT' },
  { value: 'Heard Island and Mcdonald Islands', key: 'HM' },
  { value: 'Holy See (Vatican City State)', key: 'VA' },
  { value: 'Honduras', key: 'HN' },
  { value: 'Hong Kong', key: 'HK' },
  { value: 'Hungary', key: 'HU' },
  { value: 'Iceland', key: 'IS' },
  { value: 'India', key: 'IN' },
  { value: 'Indonesia', key: 'ID' },
  { value: 'Iran, Islamic Republic Of', key: 'IR' },
  { value: 'Iraq', key: 'IQ' },
  { value: 'Ireland', key: 'IE' },
  { value: 'Isle of Man', key: 'IM' },
  { value: 'Israel', key: 'IL' },
  { value: 'Italy', key: 'IT' },
  { value: 'Jamaica', key: 'JM' },
  { value: 'Japan', key: 'JP' },
  { value: 'Jersey', key: 'JE' },
  { value: 'Jordan', key: 'JO' },
  { value: 'Kazakhstan', key: 'KZ' },
  { value: 'Kenya', key: 'KE' },
  { value: 'Kiribati', key: 'KI' },
  { value: "Korea, Democratic People'S Republic of", key: 'KP' },
  { value: 'Korea, Republic of', key: 'KR' },
  { value: 'Kuwait', key: 'KW' },
  { value: 'Kyrgyzstan', key: 'KG' },
  { value: "Lao People'S Democratic Republic", key: 'LA' },
  { value: 'Latvia', key: 'LV' },
  { value: 'Lebanon', key: 'LB' },
  { value: 'Lesotho', key: 'LS' },
  { value: 'Liberia', key: 'LR' },
  { value: 'Libyan Arab Jamahiriya', key: 'LY' },
  { value: 'Liechtenstein', key: 'LI' },
  { value: 'Lithuania', key: 'LT' },
  { value: 'Luxembourg', key: 'LU' },
  { value: 'Macao', key: 'MO' },
  { value: 'Macedonia, The Former Yugoslav Republic of', key: 'MK' },
  { value: 'Madagascar', key: 'MG' },
  { value: 'Malawi', key: 'MW' },
  { value: 'Malaysia', key: 'MY' },
  { value: 'Maldives', key: 'MV' },
  { value: 'Mali', key: 'ML' },
  { value: 'Malta', key: 'MT' },
  { value: 'Marshall Islands', key: 'MH' },
  { value: 'Martinique', key: 'MQ' },
  { value: 'Mauritania', key: 'MR' },
  { value: 'Mauritius', key: 'MU' },
  { value: 'Mayotte', key: 'YT' },
  { value: 'Mexico', key: 'MX' },
  { value: 'Micronesia, Federated States of', key: 'FM' },
  { value: 'Moldova, Republic of', key: 'MD' },
  { value: 'Monaco', key: 'MC' },
  { value: 'Mongolia', key: 'MN' },
  { value: 'Montserrat', key: 'MS' },
  { value: 'Morocco', key: 'MA' },
  { value: 'Mozambique', key: 'MZ' },
  { value: 'Myanmar', key: 'MM' },
  { value: 'Namibia', key: 'NA' },
  { value: 'Nauru', key: 'NR' },
  { value: 'Nepal', key: 'NP' },
  { value: 'Netherlands', key: 'NL' },
  { value: 'Netherlands Antilles', key: 'AN' },
  { value: 'New Caledonia', key: 'NC' },
  { value: 'New Zealand', key: 'NZ' },
  { value: 'Nicaragua', key: 'NI' },
  { value: 'Niger', key: 'NE' },
  { value: 'Nigeria', key: 'NG' },
  { value: 'Niue', key: 'NU' },
  { value: 'Norfolk Island', key: 'NF' },
  { value: 'Northern Mariana Islands', key: 'MP' },
  { value: 'Norway', key: 'NO' },
  { value: 'Oman', key: 'OM' },
  { value: 'Pakistan', key: 'PK' },
  { value: 'Palau', key: 'PW' },
  { value: 'Palestinian Territory, Occupied', key: 'PS' },
  { value: 'Panama', key: 'PA' },
  { value: 'Papua New Guinea', key: 'PG' },
  { value: 'Paraguay', key: 'PY' },
  { value: 'Peru', key: 'PE' },
  { value: 'Philippines', key: 'PH' },
  { value: 'Pitcairn', key: 'PN' },
  { value: 'Poland', key: 'PL' },
  { value: 'Portugal', key: 'PT' },
  { value: 'Puerto Rico', key: 'PR' },
  { value: 'Qatar', key: 'QA' },
  { value: 'Reunion', key: 'RE' },
  { value: 'Romania', key: 'RO' },
  { value: 'Russian Federation', key: 'RU' },
  { value: 'RWANDA', key: 'RW' },
  { value: 'Saint Helena', key: 'SH' },
  { value: 'Saint Kitts and Nevis', key: 'KN' },
  { value: 'Saint Lucia', key: 'LC' },
  { value: 'Saint Pierre and Miquelon', key: 'PM' },
  { value: 'Saint Vincent and the Grenadines', key: 'VC' },
  { value: 'Samoa', key: 'WS' },
  { value: 'San Marino', key: 'SM' },
  { value: 'Sao Tome and Principe', key: 'ST' },
  { value: 'Saudi Arabia', key: 'SA' },
  { value: 'Senegal', key: 'SN' },
  { value: 'Serbia and Montenegro', key: 'CS' },
  { value: 'Seychelles', key: 'SC' },
  { value: 'Sierra Leone', key: 'SL' },
  { value: 'Singapore', key: 'SG' },
  { value: 'Slovakia', key: 'SK' },
  { value: 'Slovenia', key: 'SI' },
  { value: 'Solomon Islands', key: 'SB' },
  { value: 'Somalia', key: 'SO' },
  { value: 'South Africa', key: 'ZA' },
  { value: 'South Georgia and the South Sandwich Islands', key: 'GS' },
  { value: 'Spain', key: 'ES' },
  { value: 'Sri Lanka', key: 'LK' },
  { value: 'Sudan', key: 'SD' },
  { value: 'Surivalue', key: 'SR' },
  { value: 'Svalbard and Jan Mayen', key: 'SJ' },
  { value: 'Swaziland', key: 'SZ' },
  { value: 'Sweden', key: 'SE' },
  { value: 'Switzerland', key: 'CH' },
  { value: 'Syrian Arab Republic', key: 'SY' },
  { value: 'Taiwan, Province of China', key: 'TW' },
  { value: 'Tajikistan', key: 'TJ' },
  { value: 'Tanzania, United Republic of', key: 'TZ' },
  { value: 'Thailand', key: 'TH' },
  { value: 'Timor-Leste', key: 'TL' },
  { value: 'Togo', key: 'TG' },
  { value: 'Tokelau', key: 'TK' },
  { value: 'Tonga', key: 'TO' },
  { value: 'Trinidad and Tobago', key: 'TT' },
  { value: 'Tunisia', key: 'TN' },
  { value: 'Turvalue', key: 'TR' },
  { value: 'Turkmenistan', key: 'TM' },
  { value: 'Turks and Caicos Islands', key: 'TC' },
  { value: 'Tuvalu', key: 'TV' },
  { value: 'Uganda', key: 'UG' },
  { value: 'Ukraine', key: 'UA' },
  { value: 'United Arab Emirates', key: 'AE' },
  { value: 'United Kingdom', key: 'GB' },
  { value: 'United States', key: 'US' },
  { value: 'United States Minor Outlying Islands', key: 'UM' },
  { value: 'Uruguay', key: 'UY' },
  { value: 'Uzbekistan', key: 'UZ' },
  { value: 'Vanuatu', key: 'VU' },
  { value: 'Venezuela', key: 'VE' },
  { value: 'Viet Nam', key: 'VN' },
  { value: 'Virgin Islands, British', key: 'VG' },
  { value: 'Virgin Islands, U.S.', key: 'VI' },
  { value: 'Wallis and Futuna', key: 'WF' },
  { value: 'Western Sahara', key: 'EH' },
  { value: 'Yemen', key: 'YE' },
  { value: 'Zambia', key: 'ZM' },
  { value: 'Zimbabwe', key: 'ZW' },
];

const mapCountryCodeToName = () => {
  const countryMap: { [key: string]: string } = {};
  countries.forEach((country) => {
    countryMap[country.key.toUpperCase()] = country.value;
  });
  return countryMap;
};

const mapCountryNameToCode = () => {
  const countryMap: { [key: string]: string } = {};
  countries.forEach((country) => {
    countryMap[country.value.toUpperCase()] = country.key;
  });
  return countryMap;
};

export const countryCodeToName = mapCountryCodeToName();
export const countryNameToCode = mapCountryNameToCode();

export enum EIdentifierType {
  TAX_CODE = 'TAX_CODE', // Mã số thuế doanh nghiệp
  PEOPLE_ID = 'PEOPLE_ID', // Mã số căn cước công dân/ Chứng minh thư
}

export enum ECustomerGroup {
  INDIVIDUAL = 'INDIVIDUAL', // Cá nhân
  BUSINESS_AGENT = 'BUSINESS_AGENT', // Đại lý kinh doanh
  PROCESSING_ENTERPRISES = 'PROCESSING_ENTERPRISES', // Doanh nghiệp chế xuất
  ORDINARY_BUSINESS = 'ORDINARY_BUSINESS', // Doanh nghiệp thông thường
  SERVICE_PROVIDER = 'SERVICE_PROVIDER', // Nhà cung cấp dịch vụ
  FOREIGN_AGENT = 'FOREIGN_AGENT', // Đại lý nước ngoài
  BOTH_CUSTOMER_AND_SUPPLIER = 'BOTH_CUSTOMER_AND_SUPPLIER', // Vừa là Khách hàng vừa là Nhà cung cấp
}

export enum ECustomerGroupMessage {
  INDIVIDUAL = 'Cá nhân', // Cá nhân
  BUSINESS_AGENT = 'Đại lý kinh doanh', // Đại lý kinh doanh
  PROCESSING_ENTERPRISES = 'Doanh nghiệp chế xuất', // Doanh nghiệp chế xuất
  ORDINARY_BUSINESS = 'Doanh nghiệp thông thường', // Doanh nghiệp thông thường
  SERVICE_PROVIDER = 'Nhà cung cấp dịch vụ', // Nhà cung cấp dịch vụ
  FOREIGN_AGENT = 'Đại lý nước ngoài', // Đại lý nước ngoài
  BOTH_CUSTOMER_AND_SUPPLIER = 'Vừa là Khách hàng vừa là Nhà cung cấp', // Vừa là Khách hàng vừa là Nhà cung cấp
}

export enum EServiceRequest {
  SPECIALIZE_LINE = 'SPECIALIZE_LINE', // Chuyên tuyến
  DHL = 'DHL', // DHL
  UPS = 'UPS', // UPS
  FEDEX = 'FEDEX', //Fedex
  SEA_FRIEGHT = 'SEA_FRIEGHT', //Sea Frieght
  AIR_FRIEGHT = 'AIR_FRIEGHT', //Air Frieght
  TRUCKING = 'TRUCKING', //TRUCKING
  CLEARANCE = 'CLEARANCE', //Thông quan
  UNOFFICIAL_QUOTA = 'UNOFFICIAL_QUOTA', //Tiểu ngạch
  BUY_IT = 'BUY_IT', //Mua hộ
  IMPORT_TAX_BAG = 'IMPORT_TAX_BAG', //Nhập bao thuế
  SPLIT_ENTRY = 'SPLIT_ENTRY', //Nhập chia tách
}

export enum ETypeContract {
  INDEFINITE = 'INDEFINITE', // Không xác định
  TIME_LIMIT = 'TIME_LIMIT', // Giới hạn thời gian
}

export enum ETypeStaff {
  DEBT_COLLECTOR = 'DEBT_COLLECTOR', // Nhân viên thu nợ
  CODE_OPENING_STAFF = 'CODE_OPENING_STAFF', // Nhân viên mở mã
  FORWARDING_STAFF = 'FORWARDING_STAFF', // Nhân viên giao nhận
  BUSINESS_STAFF = 'BUSINESS_STAFF', // Nhân viên kinh doanh => Nhân viên mở mã khách hàng
  TELESALE_STAFF = 'TELESALE_STAFF', // Nhân viên Dịch vụ khách hàng
  INVOICING_STAFF = 'INVOICING_STAFF', // Nhân viên xuất hóa đơn
  // EXPRESS_SERVICE_SALES_STAFF = 'EXPRESS_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Express
  // FORWARDING_SERVICE_SALES_STAFF = 'FORWARDING_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Forwarding
  // DOMESTICS_SERVICE_SALES_STAFF = 'DOMESTICS_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Domestics
  // ECOMMERCE_SERVICE_SALES_STAFF = 'ECOMMERCE_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Ecommerce
  SALES_STAFF_ARE_HANDLE_OVER = 'SALES_STAFF_ARE_HANDLE_OVER', // Nhân viên kinh doanh được bàn giao
  GROUP_BUSINESS_MANAGEMENT = 'GROUP_BUSINESS_MANAGEMENT', // Quản lý Kinh doanh Cấp Tổ
  DEPARTMENT_BUSINESS_MANAGEMENT = 'DEPARTMENT_BUSINESS_MANAGEMENT', // Quản lý Kinh doanh Cấp Phòng
  DOMAIN_BUSINESS_MANAGEMENT = 'DOMAIN_BUSINESS_MANAGEMENT', // Quản lý Kinh doanh Cấp Miền
  // OLD_BUSINESS_HANDED_OVER_TO_MANAGER = 'OLD_BUSINESS_HANDED_OVER_TO_MANAGER', // Kinh doanh cũ đã Quản lý bàn giao sang
  // OLD_BUSINESS_JUST_QUIT = 'OLD_BUSINESS_JUST_QUIT', // Kinh doanh cũ vừa nghỉ việc
  // OLD_BUSINESS_HAS_RETIRED = 'OLD_BUSINESS_HAS_RETIRED', // Kinh doanh cũ đã nghỉ việc
}

export enum ETypeStaffMessage {
  DEBT_COLLECTOR = 'Nhân viên thu nợ', // Nhân viên thu nợ
  CODE_OPENING_STAFF = 'Nhân viên quản lý khách hàng', // Nhân viên mở mã => Nhân viên quản lý khách hàng
  FORWARDING_STAFF = 'Nhân viên giao nhận', // Nhân viên giao nhận
  BUSINESS_STAFF = 'Nhân viên mở mã khách hàng', // Nhân viên kinh doanh => Nhân viên mở mã khách hàng
  TELESALE_STAFF = 'Nhân viên Dịch vụ khách hàng', // Nhân viên Dịch vụ khách hàng
  INVOICING_STAFF = 'Nhân viên xuất hóa đơn', // Nhân viên xuất hóa đơn
  // EXPRESS_SERVICE_SALES_STAFF = 'EXPRESS_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Express
  // FORWARDING_SERVICE_SALES_STAFF = 'FORWARDING_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Forwarding
  // DOMESTICS_SERVICE_SALES_STAFF = 'DOMESTICS_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Domestics
  // ECOMMERCE_SERVICE_SALES_STAFF = 'ECOMMERCE_SERVICE_SALES_STAFF', // Nhân viên kinh doanh dịch vụ Ecommerce
  SALES_STAFF_ARE_HANDLE_OVER = 'Nhân viên kinh doanh được bàn giao', // Nhân viên kinh doanh được bàn giao
  GROUP_BUSINESS_MANAGEMENT = 'Quản lý Kinh doanh Cấp Tổ', // Quản lý Kinh doanh Cấp Tổ
  DEPARTMENT_BUSINESS_MANAGEMENT = 'Quản lý Kinh doanh Cấp Phòng', // Quản lý Kinh doanh Cấp Phòng
  DOMAIN_BUSINESS_MANAGEMENT = 'Quản lý Kinh doanh Cấp Miền', // Quản lý Kinh doanh Cấp Miền
  // OLD_BUSINESS_HANDED_OVER_TO_MANAGER = 'OLD_BUSINESS_HANDED_OVER_TO_MANAGER', // Kinh doanh cũ đã Quản lý bàn giao sang
  // OLD_BUSINESS_JUST_QUIT = 'OLD_BUSINESS_JUST_QUIT', // Kinh doanh cũ vừa nghỉ việc
  // OLD_BUSINESS_HAS_RETIRED = 'OLD_BUSINESS_HAS_RETIRED', // Kinh doanh cũ đã nghỉ việc
}

export enum ETypePayment {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export enum ETypeExportBill {
  BILL = 'BILL',
  PARTNER = 'PARTNER',
  SMALL_BILL = 'SMALL_BILL',
}

export enum EFixedPriceCode {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5',
  P6 = 'P6',
  P7 = 'P7',
  P8 = 'P8',
  P9 = 'P9',
  P10 = 'P10',
  OTHER_PRICE = 'OTHER_PRICE',
}

export enum ETypeService {
  SERVICE_BOOKING = 'SERVICE_BOOKING',
  SERVICE_PARTNER = 'SERVICE_PARTNER',
  SMALL_SERVICE = 'SMALL_SERVICE',
  CONNECTION_PARTNER = 'CONNECTION_PARTNER',
}

export enum EFormatDate {
  DD_MM_YYYY = 'DD/MM/YYYY',
  DD_MM_YYYY_HH_mm = 'DD/MM/YYYY HH:mm',
}

export enum EStatusDelivery {
  information_received = 0, // Thông tin đã nhận
  pickup_acf = 1, // PU acf xác nhận đã lấy hàng
  pickup_acf_confirm = 2, // PU acf xác nhận đã xử lý hàng
  op_acf = 3, // OP đã tiếp nhận đơn hàng
  op_acf_confirm = 4, // OP xác nhận đơn hàng
  pickup_partner = 5, // Chuyển hàng hóa cho đơn vị đối tác
  done = 6, // Thành công
}

export enum EStatusDeliveryMessage {
  information_received = "Shipment information received",
  pickup_acf = 'Shipment picked up',
  op_acf = 'Arrived at MH Great Sun Sort Facility ',
  op_acf_confirm = 'Processed at MH Great Sun',
  pickup_partner = 'Shipment has departed from MH Great Sun facility ',
  done = 'Delivered',
}

export enum ETypeUser {
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export enum EZoneService {
  FOREIGN = 'FOREIGN',
  DOMESTIC = 'DOMESTIC',
}

export enum EExportForm {
  DIRECT = 'DIRECT', // Trực tiếp
  TRANSIT = 'TRANSIT', // Gián tiếp
}

export enum ETransportationType {
  PLANES = 'PLANES', //Máy bay
  SHIP = 'SHIP', // Tàu biển
  ROAD = 'ROAD', // Đường bộ
  TRAIN = 'TRAIN', // Đường tàu
}

export enum ETransportationTypeVN {
  PLANES = 'Máy bay', //Máy bay
  SHIP = 'Tàu biển', // Tàu biển
  ROAD = 'Đường bộ', // Đường bộ
  TRAIN = 'Đường tàu', // Đường tàu
}

export enum EStatusDeliveryAcftership {
  InfoReceived = 'InfoReceived',
  InTransit = 'InTransit',
  OutForDelivery = 'OutForDelivery',
  AttemptFail = 'AttemptFail',
  Delivered = 'Delivered',
  AvailableForPickup = 'AvailableForPickup',
  Exception = 'Exception',
  Expired = 'Expired',
  Pending = 'Pending',
}

export enum EAddressBookingType {
  SENDER_ADDRESS = 'SENDER_ADDRESS',
  RECEIVER_ADDRESS = 'RECEIVER_ADDRESS',
}

export enum EHomePage {
  TOP = 'TOP',
  HEADER = 'HEADER',
  BODY = 'BODY',
  FOOTER = 'FOOTER',
  SERVICE = 'SERVICE',
}

export enum ETypeLinkHomepage {
  LINK = 'LINK',
  CATEGORY = 'CATEGORY',
  POST = 'POST',
}

export enum ETypePuDeliveryDetail {
  PICKUP = 'PICKUP',
  OP = 'OP',
}

export enum EPartnerServiceKey {
  YAMATO = 'YAMATO', // Yamato miền bắc
  YAMATO_SOUTHERN = 'YAMATO_SOUTHERN', // Yamato miền Nam
  K_CARGO = 'K_CARGO', // K Cargo
  NO_PARTNER_SERVICE_YET = 'NO_PARTNER_SERVICE_YET', // Chưa có đối tác dịch vụ
}

export enum ECustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ECustomerStatusMessage {
  ACTIVE = 'Khách hàng hoạt động',
  INACTIVE = 'Khách hàng đóng mã',
}

export enum ETypeStatisticalRevenueCustomer {
  CUSTOMERS_NOT_ENTER_NETWORK = 'CUSTOMERS_NOT_ENTER_NETWORK', // Khách hàng không vào mạng
  CUSTOMERS_SEND_REDUCTION = 'CUSTOMERS_SEND_REDUCTION', // Khách hàng gửi giảm
  CUSTOMERS_SEND_INCREASE = 'CUSTOMERS_SEND_INCREASE', // Khách hàng gửi tăng
}