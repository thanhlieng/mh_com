import { HandCoinsIcon } from 'lucide-react';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';

const PaymentManagementContainer = () => {
  return (
    <div className='flex flex-1 flex-col'>
      {/* Page header */}
      <div className='flex h-14 items-center border-b border-border px-6'>
        <div className='flex items-center gap-2'>
          <HandCoinsIcon className='h-4 w-4 text-muted-foreground' />
          <h1 className='text-sm font-semibold text-foreground'>
            Quản lý chi hộ
          </h1>
        </div>
      </div>

      {/* Content area — placeholder */}
      <div className='flex flex-1 items-center justify-center p-8'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted'>
            <HandCoinsIcon className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium text-foreground'>Quản lý chi hộ</p>
          <p className='max-w-xs text-xs text-muted-foreground'>
            Nội dung màn hình sẽ được triển khai ở bước tiếp theo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default withPrivateRouteSupplier(PaymentManagementContainer);
