/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseISO } from 'date-fns';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ContainerIcon,
  HandCoinsIcon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
  FileTextIcon,
  UploadCloudIcon,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';

import { useQuery } from 'react-query';
import {
  getOrderByCode,
  listChiHoFiles,
} from '@/services/supplier.services';
import type {
  ChiHoFile,
  OrderByCodeResponse,
  OrderContainerRow,
} from '@/services/supplier.services';
import { ChiHoUploadModal } from '@/container/CostStatementContainer/ChiHoUploadModal';
import { FileUploadPanel } from './FileUploadPanel';
import { UploadRequestsTab } from './UploadRequestsTab';
import { type UploadedFile } from './types';

type TabKey = 'search' | 'uploads';

function mapChiHoFileToUploaded(f: ChiHoFile): UploadedFile {
  const ext = f.file_name?.split('.').pop()?.toLowerCase() ?? '';
  let type: UploadedFile['type'] = 'other';
  if (ext === 'pdf') type = 'pdf';
  else if (['xls', 'xlsx', 'csv'].includes(ext)) type = 'excel';
  else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) type = 'image';
  return {
    id: String(f.id),
    name: f.file_name ?? `file-${f.id}`,
    type,
    size: 0,
    uploadedAt: f.created_at,
    url: f.file_url ?? undefined,
    approvalStatus: f.approval_status,
  };
}

const formatDate = (iso: string) => {
  try {
    return parseISO(iso).toLocaleDateString('vi-VN');
  } catch {
    return iso;
  }
};

const PaymentManagementContainer = () => {
  const [activeTab, setActiveTab] = React.useState<TabKey>('search');
  const [rawSearch, setRawSearch] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState<string | null>(null);

  const apiQuery = useQuery(
    ['chiho-search', searchQuery],
    () => getOrderByCode(searchQuery!),
    { enabled: !!searchQuery, retry: false }
  );

  const orders = React.useMemo<OrderByCodeResponse[]>(
    () => (apiQuery.data ? [apiQuery.data] : []),
    [apiQuery.data]
  );

  const [filesByOrder, setFilesByOrder] = React.useState<
    Record<number, UploadedFile[]>
  >({});

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  // Mở/đóng danh sách container (dòng con) — mặc định MỞ.
  const [collapsed, setCollapsed] = React.useState<Record<number, boolean>>({});
  const isExpanded = (orderId: number) => collapsed[orderId] !== true;
  const toggleExpand = (orderId: number) =>
    setCollapsed((prev) => ({ ...prev, [orderId]: !prev[orderId] ? true : false }));

  // Upload file Chi hộ theo container: container đang mở modal + số file đã
  // upload theo từng container (giữ khi còn ở màn này).
  const [uploadContainer, setUploadContainer] = React.useState<
    { order: OrderByCodeResponse; container: OrderContainerRow } | null
  >(null);
  const [containerUploadedCounts, setContainerUploadedCounts] = React.useState<
    Record<number, number>
  >({});

  const filesQuery = useQuery(
    ['chiho-files', selectedOrder?.id],
    () => listChiHoFiles(selectedOrder!.id),
    { enabled: !!selectedOrder?.id, retry: false }
  );

  React.useEffect(() => {
    if (!filesQuery.data || selectedId == null) return;
    const mapped = filesQuery.data.data.map(mapChiHoFileToUploaded);
    setFilesByOrder((prev) => ({ ...prev, [selectedId]: mapped }));
  }, [filesQuery.data, selectedId]);

  const handleSearch = () => {
    const trimmed = rawSearch.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setSelectedId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleFilesChange = React.useCallback(
    (orderId: number, files: UploadedFile[]) => {
      setFilesByOrder((prev) => ({ ...prev, [orderId]: files }));
      filesQuery.refetch();
    },
    [filesQuery]
  );

  const returnError = (error: any) => {
    if (error && error?.response && error?.response?.status == 404) {
      return <div className='py-16 text-center text-xs text-destructive'>
           Không tìm thấy đơn hàng phù hợp với từ khóa &quot;{searchQuery}&quot;
          </div>
    }
    return( <div className='py-16 text-center text-xs text-destructive'>
            Có lỗi xảy ra khi tìm kiếm. Vui lòng liên hệ MHGS
          </div>)
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header ── */}
      <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2 md:px-6'>
        <HandCoinsIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
        <h1 className='text-sm font-semibold'>Quản lý chi hộ</h1>
      </div>

      {/* ── Tabs ── */}
      <div className='flex shrink-0 items-center gap-1 border-b border-border px-4 md:px-6'>
        {([
          { key: 'search', label: 'Tra cứu & tải lên' },
          { key: 'uploads', label: 'Danh sách yêu cầu tải lên' },
        ] as { key: TabKey; label: string }[]).map((t) => (
          <button
            key={t.key}
            type='button'
            onClick={() => setActiveTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'uploads' && <UploadRequestsTab />}

      {activeTab === 'search' && (
        <>
      {/* ── Search bar ── */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-4 md:px-6'>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1 max-w-md'>
            <SearchIcon className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Nhập chính xác số booking / bill...'
              className='h-9 pl-8 text-sm'
            />
          </div>
          <Button size='sm' className='h-9 gap-1.5 text-xs' onClick={handleSearch} disabled={apiQuery.isFetching}>
            {apiQuery.isFetching ? (
              <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <SearchIcon className='h-3.5 w-3.5' />
            )}
            {apiQuery.isFetching ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          {searchQuery && (
            <Button
              variant='outline'
              size='sm'
              className='h-9 gap-1.5 text-xs'
              onClick={() => apiQuery.refetch()}
              disabled={apiQuery.isFetching}
              title='Tải lại kết quả'
            >
              <RefreshCwIcon
                className={cn('h-3.5 w-3.5', apiQuery.isFetching && 'animate-spin')}
              />
              Tải lại
            </Button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {!searchQuery && (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <FileTextIcon className='mb-3 h-10 w-10 text-muted-foreground/40' />
            <p className='text-sm font-medium text-muted-foreground'>
              Nhập số booking / bill và nhấn Tìm kiếm
            </p>
            <p className='text-xs text-muted-foreground/60'>
              Tìm theo số booking / bill (khớp chính xác)
            </p>
          </div>
        )}

        {apiQuery.isFetching && searchQuery && (
          <div className='flex items-center justify-center gap-2 py-20 text-xs text-muted-foreground'>
            <Loader2Icon className='h-4 w-4 animate-spin' />
            Đang tìm kiếm...
          </div>
        )}

        {apiQuery.isError && searchQuery && (
          returnError(apiQuery.error)
          
        )}

        {apiQuery.data && orders.length === 0 && (
          <div className='py-16 text-center text-xs text-muted-foreground'>
            Không tìm thấy đơn hàng phù hợp với từ khóa &quot;{searchQuery}&quot;
          </div>
        )}

        {orders.length > 0 && (
          <>
            <div className='mb-3 text-xs text-muted-foreground'>
              Tìm thấy {orders.length} đơn hàng
            </div>
            {/* Card list — mobile */}
            <div className='flex flex-col gap-2 md:hidden'>
              {orders.map((o) => (
                <div
                  key={o.id}
                  className='flex w-full flex-col gap-2 rounded-md border border-border bg-background p-3'
                >
                  <button
                    onClick={() => setSelectedId(o.id)}
                    className='flex flex-col gap-1.5 text-left'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-sm font-semibold text-primary'>
                        {o.order_code}
                      </span>
                      <span className='text-sm font-semibold text-primary'>
                        {o.booking_bill_number}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>{o.created_by}</span>
                      <span>{formatDate(o.created_at)}</span>
                    </div>
                  </button>

                  {/* Container (dòng con) — upload theo container */}
                  <div className='flex flex-col gap-1.5 border-t border-border pt-2'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Container ({(o.containers ?? []).length})
                    </span>
                    {(o.containers ?? []).length === 0 ? (
                      <span className='text-[11px] italic text-muted-foreground'>
                        Không có container thuộc bạn
                      </span>
                    ) : (
                      (o.containers ?? []).map((c) => (
                        <div
                          key={c.id}
                          className='flex items-center justify-between gap-2 rounded border border-border bg-muted/10 px-2 py-1.5'
                        >
                          <div className='flex min-w-0 items-center gap-1.5'>
                            <ContainerIcon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                            <span className='truncate text-xs font-medium'>
                              {c.container_no || '—'}
                            </span>
                            {c.container_kind && (
                              <Badge variant='outline'>{c.container_kind}</Badge>
                            )}
                          </div>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-7 shrink-0 gap-1.5 text-[11px]'
                            onClick={() => setUploadContainer({ order: o, container: c })}
                          >
                            <UploadCloudIcon className='h-3.5 w-3.5' />
                            Tải file
                            {containerUploadedCounts[c.id] > 0 && (
                              <Badge variant='success' className='ml-0.5 px-1 text-[9px]'>
                                {containerUploadedCounts[c.id]}
                              </Badge>
                            )}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Table — desktop */}
            <div className='hidden w-full min-w-max rounded-md border border-border md:block'>
              <table className='w-full border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/40 text-left'>
                    <th className='px-3 py-2 text-xs font-semibold'>STT</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Mã đơn</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Mã booking</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Ngày tạo</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Người liên hệ</th>
                    {/* <th className='px-3 py-2 text-center text-xs font-semibold'>
                      Chứng từ
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => {
                    const containers = o.containers ?? [];
                    const expanded = isExpanded(o.id);
                    return (
                      <React.Fragment key={o.id}>
                        <tr
                          onClick={() => setSelectedId(o.id)}
                          className={cn(
                            'cursor-pointer border-b border-border transition-colors hover:bg-primary/5',
                            i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                          )}
                        >
                          <td className='px-3 py-2 text-xs text-muted-foreground'>
                            <div className='flex items-center gap-1'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(o.id);
                                }}
                                className='rounded p-0.5 hover:bg-accent'
                                title={expanded ? 'Thu gọn container' : 'Xem container'}
                              >
                                {expanded ? (
                                  <ChevronDownIcon className='h-3.5 w-3.5' />
                                ) : (
                                  <ChevronRightIcon className='h-3.5 w-3.5' />
                                )}
                              </button>
                              {i + 1}
                            </div>
                          </td>
                          <td className='px-3 py-2 text-xs font-medium text-primary'>
                            {o.order_code}
                          </td>
                          <td className='px-3 py-2 text-xs'>{o.booking_bill_number}</td>
                          <td className='px-3 py-2 text-xs'>{formatDate(o.created_at)}</td>
                          <td className='px-3 py-2 text-xs'>{o.created_by}</td>
                        </tr>

                        {/* Dòng con: container của đơn (supplier có PNL) */}
                        {expanded && containers.length === 0 && (
                          <tr className='border-b border-border bg-muted/5'>
                            <td />
                            <td colSpan={4} className='px-3 py-2 text-xs italic text-muted-foreground'>
                              Không có container nào thuộc bạn trong đơn này
                            </td>
                          </tr>
                        )}
                        {expanded &&
                          containers.map((c) => (
                            <tr key={`c-${c.id}`} className='border-b border-border bg-muted/5'>
                              <td className='px-3 py-1.5' />
                              <td colSpan={2} className='px-3 py-1.5 text-xs'>
                                <div className='flex items-center gap-2 pl-3'>
                                  <ContainerIcon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                                  <span className='font-medium'>{c.container_no || '—'}</span>
                                  {c.container_kind && (
                                    <Badge variant='outline'>{c.container_kind}</Badge>
                                  )}
                                </div>
                              </td>
                              <td className='px-3 py-1.5 text-xs text-muted-foreground'>
                                {c.loai_hang_hoa || '—'}
                              </td>
                              <td className='px-3 py-1.5'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='h-7 gap-1.5 text-[11px]'
                                  onClick={() => setUploadContainer({ order: o, container: c })}
                                >
                                  <UploadCloudIcon className='h-3.5 w-3.5' />
                                  Tải file
                                  {containerUploadedCounts[c.id] > 0 && (
                                    <Badge variant='success' className='ml-0.5 px-1 text-[9px]'>
                                      {containerUploadedCounts[c.id]}
                                    </Badge>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Slide-over upload panel (theo đơn) ── */}
      {selectedOrder && (
        <FileUploadPanel
          order={selectedOrder}
          files={filesByOrder[selectedOrder.id] ?? []}
          onClose={() => setSelectedId(null)}
          onFilesChange={handleFilesChange}
        />
      )}

      {/* ── Modal upload theo container ── */}
      {uploadContainer && (
        <ChiHoUploadModal
          orderId={uploadContainer.order.id}
          orderCode={uploadContainer.order.order_code}
          containerNo={uploadContainer.container.container_no}
          bookingBillNumber={uploadContainer.order.booking_bill_number ?? undefined}
          initialUploadedCount={containerUploadedCounts[uploadContainer.container.id] ?? 0}
          onClose={() => setUploadContainer(null)}
          onUploaded={(total) =>
            setContainerUploadedCounts((prev) => ({
              ...prev,
              [uploadContainer.container.id]: total,
            }))
          }
        />
      )}
        </>
      )}
    </div>
  );
};

export default withPrivateRouteSupplier(PaymentManagementContainer);
