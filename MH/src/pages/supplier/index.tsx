import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { SUPPLIER_COST_STATEMENT } from '@/routes/routes';

const SupplierIndex = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace(SUPPLIER_COST_STATEMENT);
  }, [router]);
  return null;
};

export default SupplierIndex;
