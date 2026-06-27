import dynamic from 'next/dynamic';

import SupplierLayout from '@/layout/SupplierLayout';

const PaymentManagementContainer = dynamic(
  () => import('@/container/PaymentManagementContainer'),
  { ssr: false }
);

const PaymentManagementPage = () => {
  return <PaymentManagementContainer />;
};

PaymentManagementPage.Layout = SupplierLayout;
export default PaymentManagementPage;
