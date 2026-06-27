/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from 'antd';
import {
  FileTextIcon,
  ListChecksIcon,
  RefreshCwIcon,
  TableIcon,
} from 'lucide-react';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';
import {
  deleteChangeRequest,
  getChangeRequests,
} from '@/services/supplier.services';

import { ChangeRequestList } from './ChangeRequestList';
import KeCuocChiHoTable from './KeCuocChiHoTable';
import { type ChangeRequest, mapApiResponseToChangeRequest } from './types';

// ─── Main component ───────────────────────────────────────────────────────────

// 2 view con: 'kecuoc' = kê cước & chi hộ (mặc định) | 'requests' = đề nghị thay đổi
type View = 'kecuoc' | 'requests';

const CostStatementContainer = () => {
  const [view, setView] = React.useState<View>('kecuoc');
  const queryClient = useQueryClient();

  // Fetch change requests list từ API
  const changeRequestsQuery = useQuery(
    ['supplier-change-requests'],
    () => getChangeRequests(),
    {
      enabled: view === 'requests',
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message
            ? `${e.response.data.message}`
            : 'Tải danh sách đề nghị thay đổi thất bại',
          placement: 'top',
        });
      },
    },
  );

  const changeRequests: ChangeRequest[] = React.useMemo(() => {
    if (!changeRequestsQuery.data) return [];
    return changeRequestsQuery.data.map(mapApiResponseToChangeRequest);
  }, [changeRequestsQuery.data]);

  // Hủy một đề nghị đang chờ duyệt (chỉ áp dụng cho trạng thái "Chờ duyệt")
  const deleteRequestMutation = useMutation(deleteChangeRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('supplier-change-requests');
      notification.success({
        message: 'Đã hủy đề nghị thay đổi',
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: e?.response?.data?.message
          ? `${e.response.data.message}`
          : 'Hủy đề nghị thất bại',
        placement: 'top',
      });
    },
  });

  const handleCancelRequest = (id: string) => {
    deleteRequestMutation.mutate(id);
  };

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header ── */}
      <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2 md:h-14 md:flex-nowrap md:px-6 md:py-0'>
        <FileTextIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
        <h1 className='text-sm font-semibold'>Bảng kê chi phí</h1>
        <div className='flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-xs md:ml-auto md:w-auto'>
          {view === 'requests' && (
            <Button
              variant='outline'
              size='sm'
              className='h-8 shrink-0 gap-1.5 text-xs'
              onClick={() => changeRequestsQuery.refetch()}
              disabled={changeRequestsQuery.isFetching}
              title='Tải lại dữ liệu'
            >
              <RefreshCwIcon
                className={cn(
                  'h-3.5 w-3.5',
                  changeRequestsQuery.isFetching && 'animate-spin'
                )}
              />
              Tải lại
            </Button>
          )}
        </div>
      </div>

      {/* ── Tab bar (view con) ── */}
      <div className='flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-4 md:px-6'>
        <button
          onClick={() => setView('kecuoc')}
          className={cn(
            'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors',
            view === 'kecuoc'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <TableIcon className='h-3.5 w-3.5' />
          Kê cước &amp; chi hộ
        </button>
        <button
          onClick={() => setView('requests')}
          className={cn(
            'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors',
            view === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <ListChecksIcon className='h-3.5 w-3.5' />
          Đề nghị thay đổi
          {changeRequests.length > 0 && (
            <span className='rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground'>
              {changeRequests.length}
            </span>
          )}
        </button>
      </div>

      {view === 'kecuoc' && <KeCuocChiHoTable />}

      {view === 'requests' && (
        <ChangeRequestList
          requests={changeRequests}
          onCancel={handleCancelRequest}
        />
      )}
    </div>
  );
};

export default withPrivateRouteSupplier(CostStatementContainer);
