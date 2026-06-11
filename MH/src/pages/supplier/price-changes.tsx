import dynamic from 'next/dynamic';

import SupplierLayout from '@/layout/SupplierLayout';

const SupplierPriceChangeContainer = dynamic(
  () => import('@/container/SupplierPriceChangeContainer'),
  { ssr: false }
);

const SupplierPriceChangePage = () => {
  return <SupplierPriceChangeContainer />;
};

SupplierPriceChangePage.Layout = SupplierLayout;
export default SupplierPriceChangePage;
