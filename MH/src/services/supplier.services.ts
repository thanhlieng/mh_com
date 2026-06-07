import axiosClient2 from '@/utils/axiosClient2';

// ─── Export cost statement ────────────────────────────────────────────────────

export interface CostStatementExportParams {
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
  billCode?: string;
  customer?: string;
  route?: string;
}

/**
 * Request the backend to generate and return an Excel file for the
 * cost-statement report matching the given filters.
 *
 * TODO (backend): implement GET /supplier/cost-statement/export
 *   - Accept query params: from, to, billCode, customer, route
 *   - Return Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *   - Suggested Content-Disposition: attachment; filename="bang-ke-chi-phi.xlsx"
 */
export const exportCostStatement = (
  params: CostStatementExportParams,
): Promise<Blob> => {
  return axiosClient2.get('/supplier/cost-statement/export', {
    params,
    responseType: 'blob',
  }) as Promise<Blob>;
};
