export enum HistoryAction {
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
}

export enum HistoryType {
  Staff = 'staff',
  Customer = 'customer',
  Pickup = 'pickup',
  Operate = 'operate',
  ManifestYamato = 'manifest_yamato',
}

export enum TargetTable {
  Customers = 'customers',
  Contract = 'contract',
  PriceList = 'price_list',
  ManagementStaff = 'management_staff',
  PuDeliveries = 'pu_deliveries',
  PuDeliveriesDetail = 'pu_deliveries_detail',
  Trackings = 'trackings',
  Bookings = 'bookings',
  BookingDetail = 'booking_detail',
  ConnectBill = 'connect_bill',
  Invoice = 'invoice',
  InvoiceDetail = 'invoice_detail',
}
