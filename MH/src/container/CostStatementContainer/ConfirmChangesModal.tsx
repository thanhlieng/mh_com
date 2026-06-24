import {
  ArrowRightIcon,
  CheckCircleIcon,
  Loader2Icon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { DEFAULT_EDIT_REASON } from './types';

const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

/** Một thay đổi dirty cần xác nhận. `key` là khoá duy nhất trên reasonMap. */
export interface DirtyRowChange {
  key: string;
  /** Mã đơn / mã bill — hiển thị làm tiêu đề dòng */
  orderCode?: string;
  /** Số container (nếu có) */
  containerNo?: string;
  /** Tên dịch vụ / loại phí (vd "Cước", "Ký GS"...) */
  serviceName?: string;
  oldAmount: number;
  newAmount: number;
}

interface ConfirmChangesModalProps {
  changes: DirtyRowChange[];
  reasonMap: Record<string, string>;
  onReasonChange: (rowId: string, value: string) => void;
  onResetReason: (rowId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

/**
 * Modal xác nhận đề nghị thay đổi chi phí.
 *
 * Liệt kê từng dòng đã sửa, mỗi dòng đi kèm một textarea **lý do riêng**
 * (mặc định = DEFAULT_EDIT_REASON, user có thể chỉnh).
 *
 * Khi user xác nhận, parent sẽ build payload kèm reason từng item rồi gọi
 * createChangeRequest.
 */
export function ConfirmChangesModal({
  changes,
  reasonMap,
  onReasonChange,
  onResetReason,
  onClose,
  onConfirm,
  submitting = false,
}: ConfirmChangesModalProps) {
  // Validation: mỗi dòng phải có reason (trim non-empty)
  const missingReason = changes.some(
    (c) => !(reasonMap[c.key] ?? '').trim(),
  );

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-3 py-6'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-[1px]'
        onClick={submitting ? undefined : onClose}
      />

      <div className='relative flex max-h-full w-full max-w-3xl flex-col rounded-lg bg-background shadow-xl'>
        {/* Header */}
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>
                Xác nhận đề nghị thay đổi chi phí
              </span>
              <Badge variant='warning'>{changes.length} dòng</Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              Vui lòng kiểm tra lại các thay đổi và <strong>điền lý do</strong>{' '}
              cho từng dòng trước khi gửi MH duyệt.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className='rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50'
            title='Đóng'
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-auto px-5 py-4'>
          {changes.length === 0 ? (
            <div className='py-10 text-center text-xs text-muted-foreground'>
              Không có thay đổi nào.
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              {changes.map((c, idx) => {
                const reason = reasonMap[c.key] ?? '';
                const isReasonMissing = !reason.trim();
                const isReasonModified = reason !== DEFAULT_EDIT_REASON;
                return (
                  <div
                    key={c.key}
                    className='flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50/40 p-3'
                  >
                    {/* Top row: order info + before/after */}
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='flex min-w-0 flex-1 items-center gap-2'>
                        <span className='shrink-0 text-[10px] font-semibold text-muted-foreground'>
                          #{idx + 1}
                        </span>
                        <span className='text-xs font-semibold text-foreground'>
                          {c.orderCode || '—'}
                        </span>
                        {c.containerNo && (
                          <Badge variant='outline' className='text-[10px]'>
                            {c.containerNo}
                          </Badge>
                        )}
                        {c.serviceName && (
                          <span className='truncate text-[11px] text-muted-foreground'>
                            {c.serviceName}
                          </span>
                        )}
                      </div>
                      <div className='flex shrink-0 items-center gap-1.5 text-xs tabular-nums'>
                        <span className='text-muted-foreground line-through'>
                          {formatVND(c.oldAmount)}
                        </span>
                        <ArrowRightIcon className='h-3 w-3 text-muted-foreground' />
                        <span className='font-semibold text-emerald-700'>
                          {formatVND(c.newAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Reason textarea */}
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <label
                          htmlFor={`reason-${c.key}`}
                          className='text-[11px] font-medium text-foreground'
                        >
                          Lý do thay đổi{' '}
                          <span className='text-red-500'>*</span>
                        </label>
                        {isReasonModified && (
                          <button
                            type='button'
                            onClick={() => onResetReason(c.key)}
                            className='flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground'
                            title='Khôi phục lý do mặc định'
                          >
                            <RotateCcwIcon className='h-2.5 w-2.5' />
                            Dùng mặc định
                          </button>
                        )}
                      </div>
                      <textarea
                        id={`reason-${c.key}`}
                        value={reason}
                        onChange={(e) => onReasonChange(c.key, e.target.value)}
                        placeholder='Nhập lý do thay đổi chi phí...'
                        rows={2}
                        maxLength={500}
                        className={cn(
                          'w-full resize-y rounded-md border bg-background px-2.5 py-1.5 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                          isReasonMissing
                            ? 'border-red-300 focus-visible:ring-red-300'
                            : 'border-input',
                        )}
                      />
                      <div className='flex justify-between text-[10px]'>
                        <span
                          className={cn(
                            'text-muted-foreground',
                            isReasonMissing && 'text-red-500',
                          )}
                        >
                          {isReasonMissing
                            ? 'Vui lòng nhập lý do thay đổi'
                            : ' '}
                        </span>
                        <span className='text-muted-foreground'>
                          {reason.length}/500
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-muted/20 px-5 py-3'>
          <span className='text-[11px] text-muted-foreground'>
            Mỗi dòng cần 1 lý do riêng. MH sẽ duyệt từng dòng độc lập.
          </span>
          <div className='ml-auto flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 text-xs'
              onClick={onClose}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={onConfirm}
              disabled={
                submitting || changes.length === 0 || missingReason
              }
              title={
                missingReason
                  ? 'Cần điền lý do cho tất cả các dòng'
                  : undefined
              }
            >
              {submitting ? (
                <Loader2Icon className='h-3 w-3 animate-spin' />
              ) : (
                <CheckCircleIcon className='h-3 w-3' />
              )}
              Gửi đề nghị ({changes.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmChangesModal;
