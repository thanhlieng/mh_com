import dynamic from 'next/dynamic';

import SupplierLayout from '@/layout/SupplierLayout';

const QualityReportsContainer = dynamic(
  () => import('@/container/QualityReportsContainer'),
  { ssr: false },
);

const SupplierQualityReportsPage = () => <QualityReportsContainer />;

SupplierQualityReportsPage.Layout = SupplierLayout;
export default SupplierQualityReportsPage;
