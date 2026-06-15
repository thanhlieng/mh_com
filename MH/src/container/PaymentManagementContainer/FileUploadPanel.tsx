/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DownloadIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderUpIcon,
  ImageIcon,
  Loader2Icon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import * as React from 'react';
import { useMutation } from 'react-query';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { uploadChiHoFiles } from '@/services/supplier.services';
import type { ChiHoFile } from '@/services/supplier.services';
import { type PaymentOrder, type UploadedFile, type UploadedFileType } from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ACCEPTED_EXT = ['pdf', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp'];

const ACCEPT_ATTR =
  'application/pdf,' +
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  '.csv,' +
  'image/*';

function getFileType(name: string): UploadedFileType {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  return 'other';
}

function isAccepted(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXT.includes(ext);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const TYPE_ICON: Record<UploadedFileType, React.ReactNode> = {
  pdf: <FileTextIcon className='h-4 w-4 text-red-500' />,
  excel: <FileSpreadsheetIcon className='h-4 w-4 text-green-600' />,
  image: <ImageIcon className='h-4 w-4 text-blue-500' />,
  other: <FileIcon className='h-4 w-4 text-muted-foreground' />,
};

const STATUS_BADGE: Record<
  PaymentOrder['status'],
  React.ComponentProps<typeof Badge>['variant']
> = {
  'Chờ chi hộ': 'warning',
  'Đã chi hộ': 'success',
  'Đã đối soát': 'secondary',
  'Đã hủy': 'destructive',
};

const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// ─── Component ──────────────────────────────────────────────────────────────

interface FileUploadPanelProps {
  order: PaymentOrder;
  files: UploadedFile[];
  onClose: () => void;
  onFilesChange: (orderId: string, files: UploadedFile[]) => void;
}

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

// Nhãn trạng thái duyệt file Chi hộ (mhgs duyệt trước khi lưu vào đơn).
const APPROVAL_BADGE: Record<
  NonNullable<UploadedFile['approvalStatus']>,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Từ chối', variant: 'destructive' },
};

export function FileUploadPanel({
  order,
  files,
  onClose,
  onFilesChange,
}: FileUploadPanelProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [rejected, setRejected] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  // Upload files lên server qua API
  const uploadMutation = useMutation(
    (params: { aOrderId: number; files: File[] }) =>
      uploadChiHoFiles(params.aOrderId, params.files),
    {
      onSuccess: (res) => {
        const serverFiles = res.data.map(mapChiHoFileToUploaded);
        onFilesChange(order.id, [...files, ...serverFiles]);
      },
      onError: () => {
        // TODO: show error notification
      },
    }
  );

  const processFiles = React.useCallback(
    async (fileList: FileList | File[]) => {
      setIsProcessing(true);
      setRejected([]);
      const incoming = Array.from(fileList);
      const toUpload: File[] = [];
      const denied: string[] = [];

      for (const file of incoming) {
        if (!isAccepted(file.name)) {
          denied.push(file.name);
          continue;
        }
        toUpload.push(file);
      }

      if (toUpload.length > 0 && order.aOrderId) {
        await uploadMutation.mutateAsync({ aOrderId: order.aOrderId, files: toUpload });
      }

      if (denied.length) setRejected(denied);
      setIsProcessing(false);
    },
    [files, order.id, order.aOrderId, onFilesChange, uploadMutation]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.files;
    if (items?.length) void processFiles(items);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) void processFiles(e.target.files);
    e.target.value = ''; // cho phép chọn lại cùng file
  };

  const handleDownload = (file: UploadedFile) => {
    if (!file.url || file.url === '#') return;
    // TODO: khi có proxy tải file từ hệ thống A, dùng URL đó
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/30 backdrop-blur-[1px]'
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className='relative flex h-full w-full max-w-xl flex-col bg-background shadow-xl'>
        {/* Header */}
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>
                {order.code}
              </span>
              <Badge variant={STATUS_BADGE[order.status]}>{order.status}</Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              {order.customer} · {order.route} ·{' '}
              <span className='font-medium text-foreground'>
                {formatVND(order.amount)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground'
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-auto px-5 py-4'>
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/20'
            )}
          >
            {isProcessing ? (
              <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
            ) : (
              <UploadCloudIcon className='h-8 w-8 text-muted-foreground' />
            )}
            <p className='text-sm font-medium text-foreground'>
              {isProcessing
                ? 'Đang xử lý & tách file...'
                : 'Kéo thả file vào đây'}
            </p>
            <p className='text-xs text-muted-foreground'>
              Hỗ trợ PDF, Excel, hình ảnh. Có thể tải lên cả thư mục.
            </p>

            <div className='mt-2 flex flex-wrap items-center justify-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                className='h-8 gap-1.5 text-xs'
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <UploadCloudIcon className='h-3.5 w-3.5' />
                Chọn file
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='h-8 gap-1.5 text-xs'
                onClick={() => folderInputRef.current?.click()}
                disabled={isProcessing}
              >
                <FolderUpIcon className='h-3.5 w-3.5' />
                Chọn thư mục
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept={ACCEPT_ATTR}
              className='hidden'
              onChange={handleInputChange}
            />
            {/* webkitdirectory cho phép chọn cả thư mục */}
            <input
              ref={folderInputRef}
              type='file'
              multiple
              className='hidden'
              onChange={handleInputChange}
              {...({ webkitdirectory: '', directory: '' } as any)}
            />
          </div>

          {/* Rejected files warning */}
          {rejected.length > 0 && (
            <div className='mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
              {rejected.length} file bị bỏ qua do không đúng định dạng:{' '}
              <span className='font-medium'>{rejected.join(', ')}</span>
            </div>
          )}

          {/* Uploaded files list */}
          <div className='mt-5'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-xs font-semibold text-foreground'>
                File đã tải lên
              </h3>
              <span className='text-xs text-muted-foreground'>
                {files.length} file
              </span>
            </div>

            {files.length === 0 ? (
              <div className='rounded-md border border-dashed border-border py-10 text-center text-xs text-muted-foreground'>
                Chưa có file nào được tải lên
              </div>
            ) : (
              <ul className='flex flex-col gap-1.5'>
                {files.map((file) => (
                  <li
                    key={file.id}
                    className='flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 hover:bg-accent/40'
                  >
                    <span className='shrink-0'>{TYPE_ICON[file.type]}</span>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-1.5'>
                        <p className='truncate text-xs font-medium text-foreground'>
                          {file.name}
                        </p>
                        {file.approvalStatus && (
                          <Badge
                            variant={APPROVAL_BADGE[file.approvalStatus].variant}
                            className='shrink-0'
                          >
                            {APPROVAL_BADGE[file.approvalStatus].label}
                          </Badge>
                        )}
                      </div>
                      <p className='text-[10px] text-muted-foreground'>
                        {formatSize(file.size)} · {formatDateTime(file.uploadedAt)}
                        {file.raw && ' · Mới'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className='rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40'
                      title='Tải xuống'
                      disabled={!file.url || file.url === '#'}
                    >
                      <DownloadIcon className='h-3.5 w-3.5' />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-3'>
          <Button variant='outline' size='sm' className='h-8 text-xs' onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
