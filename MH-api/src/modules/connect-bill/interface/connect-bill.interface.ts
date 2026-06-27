export interface IConnectBill {
  id?: string;
  exportForm: string; // Hình thức xuất khẩu
  serviceId: string; //Dịch vụ
  partnerId: string; // Dịch vụ kết nối
  connectionPartnerId: string; //Đối tác kết nối
  transportationType: string; // Phương tiện vận chuyển
  mawbCode: string; //Mã MAWB/HAWB/CWB
  flightCode: string; //Mã xuất/nhập
  flightTime: Date; //Thời gian xuất/nhập
  sendingAirport: string; //Sân bay/Cảng/Nhà ga/ Nơi gửi
  receivingAirport: string; // Sân bay/Cảng/Nhà ga/ Nơi nhận
  createdAt?: Date;
  updatedAt?: Date;
}
