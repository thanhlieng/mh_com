import dynamic from 'next/dynamic';

import SupplierLayout from '@/layout/SupplierLayout';

const CostStatementContainer = dynamic(
  () => import('@/container/CostStatementContainer'),
  { ssr: false }
);

const CostStatementPage = () => {
  return <CostStatementContainer />;
};

CostStatementPage.Layout = SupplierLayout;
export default CostStatementPage;
