export interface IFinanceStatisticalDetail {
    revenue: number; // Doanh thu
    cost: number; // Giá vốn
    profit: number; // Lợi nhuận
    profitMargin: number; // Tỷ suất lợi nhuận
}

export interface IFinanceStatisticalViaCustomer {
    customerCode: string;
    customerName: string;
    salesName: string;
    openDate: string;
    unit: string;
    groupCustomer: string;
    statistical: Record<string, IFinanceStatisticalDetail>
}

export interface IFinanceStatisticalViaService {
    serviceName: string,
    statistical: Record<string, IFinanceStatisticalDetail>
}