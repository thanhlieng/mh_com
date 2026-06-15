import { useRouter } from 'next/router';
import { useEffect } from 'react';

import SupplierLayout from '@/layout/SupplierLayout';
import { SUPPLIER_SHIPPING_RATE } from '@/routes/routes';

/**
 * Màn "Yêu cầu thay đổi giá" đã được gộp thành một tab trong
 * "Thiết lập giá vận chuyển". Giữ route cũ và redirect sang tab tương ứng
 * để bookmark/link cũ không vỡ.
 */
const SupplierPriceChangePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${SUPPLIER_SHIPPING_RATE}?tab=changes`);
  }, [router]);

  return null;
};

SupplierPriceChangePage.Layout = SupplierLayout;
export default SupplierPriceChangePage;
