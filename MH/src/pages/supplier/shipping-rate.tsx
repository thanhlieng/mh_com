import dynamic from 'next/dynamic';

import SupplierLayout from '@/layout/SupplierLayout';

const ShippingRateContainer = dynamic(
  () => import('@/container/ShippingRateContainer'),
  { ssr: false }
);

const ShippingRatePage = () => {
  return <ShippingRateContainer />;
};

ShippingRatePage.Layout = SupplierLayout;
export default ShippingRatePage;
