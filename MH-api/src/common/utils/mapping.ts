import dayjs from 'dayjs';
import { IBooking } from 'src/modules/bookings/interface/bookings.interface';
import { getValueAddedService } from 'src/modules/bookings/utils/mapping';
import { ICheckpointPED } from 'src/modules/trackings/interface/checkpoint-ped.interface';
import {
  BookingStatus,
  BookingType,
  EBookingStatusMessage,
  EStatusDeliveryAcftership,
} from '../constants/common.constants';
import { GetMessageBookingType } from '../constants/message.constants';

export const mappingBookingStatus = (
  bookingStatus: string,
  trackingData?: {
    trackingTag?: string;
    puDeliveryStatus?: number;
  },
): string => {
  if (bookingStatus === BookingStatus.DONE) {
    if (trackingData?.trackingTag === EStatusDeliveryAcftership.Delivered) {
      return EBookingStatusMessage[BookingStatus.DELIVERED];
    }

    if (trackingData?.puDeliveryStatus >= 2) {
      return EBookingStatusMessage[BookingStatus.NOT_DELIVERED_YET];
    }
  }

  return EBookingStatusMessage[bookingStatus];
};

export function mappingDataGenerateExcel(booking: IBooking, checkPointPED: ICheckpointPED) {
  const bookingDetail = booking.bookingDetail;
  const invoiceDetails = booking?.invoice?.invoice_detail;

  // booking
  let sumPieces;
  let sumWeight;
  let sumWeightCharge = 0;
  let listShippingItemVi;
  let listShippingItemEn;
  let listOriginItem;
  let listUnitCalc;
  let descriptionBooking = [];

  // invoice
  let listUnitInvoice = [];
  let quantityInvoice = 0;
  let listPriceInvoice = [];
  let totalInvoice = 0;

  if (invoiceDetails) {
    for (let i = 0; i < invoiceDetails.length; i++) {
      listUnitInvoice.push(invoiceDetails[i].unitOfMeasure);
      quantityInvoice += invoiceDetails[i].quantity;
      listPriceInvoice.push(invoiceDetails[i].price);
      totalInvoice += invoiceDetails[i].price * invoiceDetails[i].quantity;
    }
  }

  if (bookingDetail) {
    sumPieces = bookingDetail.reduce((partialSum, a) => partialSum + Number(a.quantity), 0).toFixed(0);
    sumWeight = bookingDetail.reduce((partialSum, a) => partialSum + Number(a.weight), 0).toFixed(2);
    sumWeightCharge = bookingDetail.reduce((partialSum, a) => partialSum + Number(a.bulkyWeight * a.quantity), 0);

    //
    const shippingItemVi = [];
    const shippingItemEn = [];
    const originItem = [];
    const unitCalc = [];

    for (let i = 0; i < bookingDetail.length; i++) {
      if (bookingDetail[i]?.shippingItemVi?.name) shippingItemVi.push(bookingDetail[i].shippingItemVi.name);
      if (bookingDetail[i]?.shippingItemEn) shippingItemEn.push(bookingDetail[i].shippingItemEn);
      if (bookingDetail[i]?.originItem) originItem.push(bookingDetail[i].originItem);
      if (bookingDetail[i]?.calculationUnit) unitCalc.push(bookingDetail[i].calculationUnit);
      descriptionBooking.push(bookingDetail[i].description);
    }
    listShippingItemVi = shippingItemVi.join(', ');
    listShippingItemEn = shippingItemEn.join(', ');
    listOriginItem = originItem.join(', ');
    listUnitCalc = unitCalc.join(', ');
  }

  const valueAddedService = getValueAddedService(booking.dhl, booking.fedex, booking.ups);
  const specializedServices = [
    booking.valueAddedService1,
    booking.valueAddedService2,
    booking.valueAddedService3,
  ].filter(Boolean);

  return [
    booking?.isHandle ? 'Đã xử lý' : 'Chưa xử lý', // Thông tin xử lý
    dayjs(booking.createdAt).tz('asia/ho_chi_minh').format('HH:mm DD-MM-YYYY'), // Ngày booking
    dayjs(booking.estimatedDate).tz('asia/ho_chi_minh').format('HH:mm DD-MM-YYYY'), // Ngày yêu cầu lấy hàng
    booking.parentBooking || '', // AWB NO
    booking.bookingCode || '', // CWB NO
    booking?.partnerBillCode || '', // Mã bill đối tác
    booking?.service?.name || '', // Dịch vụ đối tác
    booking?.manufacture || '', // NHÀ CUNG CẤP
    booking?.partnerBillCodeDomestic || '', // MÃ BƯU TRONG NƯỚC
    booking?.partner_service_domestic?.name || '', // DỊCH VỤ ĐỐI TÁC TRONG NƯỚC
    booking?.manufactureDomestic || '', // NHÀ CUNG CẤP TRONG NƯỚC
    booking.senderCountry || '', // NƯỚC GỬI
    booking.receiverCountry || '', // NƯỚC ĐẾN
    booking?.service_booking?.name || '', // DỊCH VỤ
    booking?.type === BookingType.COMMODITY ? 'Hàng hóa' : 'Chứng từ', //LOẠI HÀNG HÓA
    booking?.isInvoice ? 'Có' : 'Không', //CÓ/KHÔNG INVOICE
    booking?.type_of_payment?.name || '', // HÌNH THỨC THANH TOÁN
    sumPieces || 0, // SỐ KIỆN
    sumWeight || 0, // TRỌNG LƯỢNG THỰC
    sumWeightCharge || 0, // TRỌNG LƯỢNG CỒNG KỀNH
    bookingDetail?.length ? bookingDetail[0].longs : '', // 'Length',
    bookingDetail?.length ? bookingDetail[0].width : '', // 'Width',
    bookingDetail?.length ? bookingDetail[0].height : '', // 'Height',
    booking?.customer?.customerCode || '', // MÃ KHÁCH HÀNG
    booking.senderNameEn || booking.senderNameVi || booking.senderContactPerson || '', // CÔNG TY GỬI (TIẾNG ANH)
    booking.senderAddressEn1 || '', // ĐỊA CHỈ GỬI TIẾNG ANH 1
    booking.senderAddressEn2 || '', // ĐỊA CHỈ GỬI TIẾNG ANH 2
    booking.senderAddressEn3 || '', // ĐỊA CHỈ GỬI TIẾNG ANH 3
    booking.senderProvince || '', // TỈNH/THÀNH PHỐ GỬI
    booking.senderTown || '', // THÀNH PHỐ/QUẬN/HUYỆN
    booking.senderPostalCode || '', //MÃ BƯU CHÍNH (NƠI GỬI)
    booking.senderContactPerson || '', // TÊN NGƯỜI GỬI
    booking.senderPhoneNumber || '', // SỐ ĐIỆN THOẠI NGƯỜI GỬI
    booking.receiverName || booking.receiverContactPerson || '', // TÊN CÔNG TY NHẬN
    booking.receiverAddress1 || '', // ĐỊA CHỈ NHẬN 1
    booking.receiverAddress2 || '', // ĐỊA CHỈ NHẬN 2
    booking.receiverAddress3 || '', // ĐỊA CHỈ NHẬN 3
    booking.receiverProvince || '', // TỈNH/THÀNH PHỐ NHẬN
    booking.receiverTown || '', // THÀNH PHỐ/QUẬN/HUYỆN
    booking.receiverPostalCode || '', // MÃ BƯU CHÍNH (NƠI NHẬN)
    booking.receiverContactPerson || '', // TÊN NGƯỜI NHẬN
    booking.receiverPhoneNumber || '', // SỐ ĐIỆN THOẠI NGƯỜI NHẬN
    descriptionBooking.join(', '), //NỘI DUNG HÀNG HÓA
    listShippingItemEn || '', // MẶT HÀNH VẬN CHUYỂN (TIẾNG ANH)
    booking?.deliveryCondition?.name?.slice(0, 3) || '', //ĐIỀU KIỆN GIAO HÀNG
    listUnitCalc || '', // ĐƠN VỊ TÍNH
    checkPointPED.pickupDate, //THỜI GIAN XÁC NHẬN LẤY HÀNG,
    checkPointPED.exportDate, //THỜI GIAN XUẤT RA KHỎI CÔNG TY
    checkPointPED.deliveredDate, //THỜI GIAN PHÁT HÀNG THÀNH CÔNG
    mappingBookingStatus(booking.status, {
      puDeliveryStatus: booking?.pu_deliveries?.status,
      trackingTag: booking?.tracking?.tag,
    }), //TRẠNG THÁI ĐƠN HÀNG
    booking.note || '', //GHI CHÚ
    specializedServices.join('\n'), // Dịch vụ chuyên tuyến/ Dịch vụ khác
    valueAddedService.dhl, // Dịch vụ DHL
    valueAddedService.fedex, // Dịch vụ Fedex
    valueAddedService.ups, // Dịch vụ UPS
    booking?.invoice?.currencyUnit?.name || '', // LOẠI TIỀN TỆ
    listUnitInvoice.join(', ') || '', // ĐƠN VỊ
    quantityInvoice || '', // TỔNG SỐ LƯỢNG
    listPriceInvoice.join(', ') || '', // ĐƠN GIÁ
    totalInvoice || '', // THÀNH TIỀN
    booking?.referenceCode || '', // MÃ BILL ĐỐI TÁC TRACKING
  ];
}


export function mappingDataBookingClientGenerateExcel(booking: IBooking) {
  const bookingDetail = booking.bookingDetail;

  let sumPieces;
  let sumWeight;
  let sumWeightCharge = 0;
  let listHSCode;
  let listOriginItem;
  let listUnitCalc;
  let descriptionBooking = []
  if (booking?.invoice?.invoice_detail) {
    const hsCode = [];
    booking.invoice.invoice_detail.map((invoiceDetail) => {
      if (invoiceDetail.HSCode) {
        hsCode.push(invoiceDetail.HSCode);
      }
    });
    listHSCode = hsCode.join(', ');
  }
  if (bookingDetail) {
    sumPieces = bookingDetail.reduce((partialSum, a) => partialSum + Number(a.quantity), 0).toFixed(0);
    sumWeight = bookingDetail.reduce((partialSum, a) => partialSum + Number(a.weight), 0).toFixed(2);
    sumWeightCharge = bookingDetail.reduce((partialSum, a) => partialSum + Number(a.bulkyWeight * a.quantity), 0);

    //
    const shippingItemVi = [];
    const shippingItemEn = [];
    const originItem = [];
    const unitCalc = [];

    for (let i = 0; i < bookingDetail.length; i++) {
      descriptionBooking.push(bookingDetail[i].description);
      if (bookingDetail[i]?.shippingItemVi?.name) shippingItemVi.push(bookingDetail[i].shippingItemVi.name);
      if (bookingDetail[i]?.shippingItemEn) shippingItemEn.push(bookingDetail[i].shippingItemEn);
      if (bookingDetail[i]?.originItem) originItem.push(bookingDetail[i].originItem);
      if (bookingDetail[i]?.calculationUnit) unitCalc.push(bookingDetail[i].calculationUnit);
    }
    listOriginItem = originItem.join(', ');
    listUnitCalc = unitCalc.join(', ');
  }

  return [
    mappingBookingStatus(booking.status, {
      puDeliveryStatus: booking?.pu_deliveries?.status,
      trackingTag: booking?.tracking?.tag,
    }), // Tình trạng
    dayjs(booking.createdAt).tz('asia/ho_chi_minh').format('YYYY-MM-DD'), // NGÀY BOOKING
    booking.referenceCode || '', // SỐ THAM CHIẾU
    booking.bookingCode || '', // CWB NO
    GetMessageBookingType(booking.type), // Loại gửi
    booking.senderCountry || '', //NƯỚC GỬI
    booking.receiverCountry || '', //NƯỚC ĐẾN
    booking?.service_booking?.name || '', // DỊCH VỤ
    sumPieces || 0, // SỐ KIỆN
    sumWeight || 0, // TRỌNG LƯỢNG THỰC
    sumWeightCharge || 0, // "TRỌNG LƯỢNG CỒNG KỀNH"
    booking.senderNameEn || booking.senderNameVi || booking.senderContactPerson || '', //CÔNG TY GỬI (TIẾNG ANH)
    booking.senderAddressEn || booking.senderAddressVi || '', // ĐỊA CHỈ GỬI (TIẾNG ANH)
    booking.senderProvince || '', //THÀNH PHỐ GỬI
    booking.senderPostalCode || '', //MÃ BƯU CHÍNH
    booking.senderContactPerson || '', // TÊN NGƯỜI GỬI
    booking.senderPhoneNumber || '', //"SỐ ĐIỆN THOẠi NGƯỜI GỬI"
    booking.receiverName || booking.receiverContactPerson || '', // TÊN CÔNG TY NHẬN
    booking.receiverAddress || '', // ĐỊA CHỈ NHẬN
    booking.receiverProvince || '', // THÀNH PHỐ NHẬN
    booking.receiverPostalCode || '', //'MÃ BƯU CHÍNH (TP NHẬN)',
    booking.receiverContactPerson || '', // TÊN NGƯỜI NHẬN
    booking.receiverPhoneNumber || '', // "SỐ ĐIỆN THOẠI NGƯỜI NHẬN"
    descriptionBooking.join(', '), // NỘI DUNG HÀNG HÓA
    booking?.deliveryCondition?.name?.slice(0, 3) || '', // "ĐIỀU KIỆN GIAO HÀNG"
    listUnitCalc || '', // Đơn vị tính
  ];
}

export function getStartDateAndEndDate(startDate: Date, endDate: Date): {startDate: Date, endDate: Date}{
  const now = new Date();

  return {
    endDate: endDate ?? new Date(now),
    startDate: startDate ?? new Date(new Date(now).setMonth(now.getMonth() - 1)),
  };
}