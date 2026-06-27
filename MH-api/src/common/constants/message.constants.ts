import {
  BookingType,
  CustomerType,
  ETypeContract,
  NetWorkCustomerType,
} from './common.constants';

export const GetMessageTypeContract = (typeContract: ETypeContract) => {
  switch (typeContract) {
    case ETypeContract.INDEFINITE:
      return 'Không xác định';

    default:
      return 'Giới hạn thời gian';
  }
};

export const GetMessageExpertise = (expertise: boolean) => {
  switch (expertise) {
    case true:
      return 'Đã thẩm định';

    default:
      return 'Chưa thẩm định';
  }
};

export const GetMessageNetWorkCustomerType = (type: string) => {
  switch (type) {
    case NetWorkCustomerType.REGULAR_CUSTOMER:
      return 'Khách hàng thường xuyên';
    case NetWorkCustomerType.LOT_CUSTOMER:
      return 'Khách hàng lô';
    case NetWorkCustomerType.RETAIL_CUSTOMER:
      return 'Khách hàng lẻ';
    default:
      return 'Khách hàng dùng thử';
  }
};

export const GetMessageCustomerType = (type: string) => {
  switch (type) {
    case CustomerType.DOMESTIC_COMPANY:
      return 'Doanh nghiệp trong nước';
    case CustomerType.FOREIGN_JOINT_VENTURE_ENTERPRISE:
      return 'Doanh nghiệp liên doanh nước ngoài';
    case CustomerType.ENTERPRISES_FOREIGN_CAPITAL:
      return 'Doanh nghiệp 100% vốn nước ngoài';
    case CustomerType.PRIVATE_ENTERPRISE:
      return 'Doanh nghiệp tư nhân, hộ cá thể';
    case CustomerType.STATE_ENTERPRISES:
      return 'Doanh nghiệp nhà nước';
    case CustomerType.REPRESENTATIVE_OFFICE:
      return 'Văn phòng đại diện';
    default:
      return 'Khách hàng cá nhân';
  }
};

export const GetMessageDirectBeneficiary = (type: boolean) => {
  switch (type) {
    case true:
      return 'Người trực tiếp hưởng';

    default:
      return 'Người thân';
  }
};

export const GetMessageBookingType = (type: string) => {
  switch (type) {
    case BookingType.COMMODITY:
      return 'Hàng Hóa';
    case BookingType.LICENSE:
      return 'Chứng từ';
    default:
      return '';
  }
};
