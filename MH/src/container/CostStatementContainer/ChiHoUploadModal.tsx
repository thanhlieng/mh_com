/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckCircle2Icon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderUpIcon,
  ImageIcon,
  Loader2Icon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import { notification } from 'antd';
import * as React from 'react';
import { useMutation } from 'react-query';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { uploadChiHoFiles } from '@/services/supplier.services';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED_EXT = ['pdf', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
const ACCEPT_ATTR =
  'application/pdf,' +
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  '.csv,image/*';

type FileType = 'pdf' | 'excel' | 'image' | 'other';

function getFileType(name: string): FileType {
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

const TYPE_ICON: Record<FileType, React.ReactNode> = {
  pdf: <FileTextIcon className='h-4 w-4 text-red-500' />,
  excel: <FileSpreadsheetIcon className='h-4 w-4 text-green-600' />,
  image: <ImageIcon className='h-4 w-4 text-blue-500' />,
  other: <FileIcon className='h-4 w-4 text-muted-foreground' />,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ChiHoUploadModalProps {
  orderId: number;
  orderCode: string;
  /** Số container — chỉ để hiển thị giúp NCC biết đang upload cho container nào. */
  containerNo?: string;
  bookingBillNumber?: string;
  /** Số file đã upload trước đó trong phiên (hiển thị lại khi mở lại modal). */
  initialUploadedCount?: number;
  onClose: () => void;
  /** Báo cho cha tổng số file đã upload (cộng dồn) của đơn này. */
  onUploaded: (totalCount: number) => void;
}

/**
 * Modal upload file Chi hộ cho một đơn — CHỈ hiển thị danh sách file user muốn
 * tải lên (staged), KHÔNG hiển thị file đã upload trước đó. Sau khi tải lên,
 * báo số file vừa tải về màn "Kê cước & chi hộ".
 */
export function ChiHoUploadModal({
  orderId,
  orderCode,
  containerNo,
  bookingBillNumber,
  initialUploadedCount = 0,
  onClose,
  onUploaded,
}: ChiHoUploadModalProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [rejected, setRejected] = React.useState<string[]>([]);
  const [staged, setStaged] = React.useState<{ key: string; file: File }[]>([]);
  // Tổng số file đã tải lên thành công trong phiên mở modal này (cộng dồn).
  const [uploadedCount, setUploadedCount] = React.useState(initialUploadedCount);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);
  const keySeq = React.useRef(0);

  const uploadMutation = useMutation(
    (files: File[]) => uploadChiHoFiles(orderId, files),
    {
      onSuccess: (res) => {
        const n = res?.data?.length ?? staged.length;
        const total = uploadedCount + n;
        setUploadedCount(total);
        onUploaded(total);
        setStaged([]);
        notification.success({
          message: `Đã tải lên ${n} file`,
          placement: 'top',
        });
      },
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message ?? 'Tải file lên thất bại',
          placement: 'top',
        });
      },
    },
  );

  const addFiles = React.useCallback((fileList: FileList | File[]) => {
    const accepted: { key: string; file: File }[] = [];
    const denied: string[] = [];
    for (const file of Array.from(fileList)) {
      if (!isAccepted(file.name)) {
        denied.push(file.name);
        continue;
      }
      keySeq.current += 1;
      accepted.push({ key: `staged-${keySeq.current}`, file });
    }
    setRejected(denied);
    if (accepted.length) setStaged((prev) => [...prev, ...accepted]);
  }, []);

  const removeStaged = (key: string) =>
    setStaged((prev) => prev.filter((s) => s.key !== key));

  const handleConfirmUpload = () => {
    if (!staged.length || uploadMutation.isLoading) return;
    uploadMutation.mutate(staged.map((s) => s.file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-[1px]' onClick={onClose} />

      <div className='relative flex h-full w-full max-w-xl flex-col bg-background shadow-xl'>
        {/* Header */}
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>{orderCode || '—'}</span>
              {bookingBillNumber && <Badge variant='secondary'>{bookingBillNumber}</Badge>}
              {containerNo && <Badge variant='outline'>{containerNo}</Badge>}
            </div>
            <p className='text-xs text-muted-foreground'>
              Tải lên file chi hộ cho container{containerNo ? ` ${containerNo}` : ' này'}
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
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
            )}
          >
            <UploadCloudIcon className='h-8 w-8 text-muted-foreground' />
            <p className='text-sm font-medium text-foreground'>Kéo thả file vào đây</p>
            <p className='text-xs text-muted-foreground'>
              Hỗ trợ PDF, Excel, hình ảnh. File chỉ được tải lên sau khi bấm{' '}
              <span className='font-medium'>Xác nhận</span>.
            </p>
            <div className='mt-2 flex flex-wrap items-center justify-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                className='h-8 gap-1.5 text-xs'
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isLoading}
              >
                <UploadCloudIcon className='h-3.5 w-3.5' /> Chọn file
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='h-8 gap-1.5 text-xs'
                onClick={() => folderInputRef.current?.click()}
                disabled={uploadMutation.isLoading}
              >
                <FolderUpIcon className='h-3.5 w-3.5' /> Chọn thư mục
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
            <input
              ref={folderInputRef}
              type='file'
              multiple
              className='hidden'
              onChange={handleInputChange}
              {...({ webkitdirectory: '', directory: '' } as any)}
            />
          </div>

          {/* Rejected warning */}
          {rejected.length > 0 && (
            <div className='mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
              {rejected.length} file bị bỏ qua do không đúng định dạng:{' '}
              <span className='font-medium'>{rejected.join(', ')}</span>
            </div>
          )}

          {/* Đã tải lên trong phiên */}
          {uploadedCount > 0 && (
            <div className='mt-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700'>
              <CheckCircle2Icon className='h-4 w-4' />
              Đã tải lên <span className='font-semibold'>{uploadedCount}</span> file trong phiên này.
            </div>
          )}

          {/* Danh sách chờ tải lên */}
          <div className='mt-5'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-xs font-semibold text-foreground'>File muốn tải lên</h3>
              {staged.length > 0 && (
                <button
                  onClick={() => setStaged([])}
                  disabled={uploadMutation.isLoading}
                  className='text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40'
                >
                  Xóa hết
                </button>
              )}
            </div>

            {staged.length === 0 ? (
              <div className='rounded-md border border-dashed border-border py-10 text-center text-xs text-muted-foreground'>
                Chưa chọn file nào
              </div>
            ) : (
              <ul className='flex flex-col gap-1.5'>
                {staged.map((s) => (
                  <li
                    key={s.key}
                    className='flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2'
                  >
                    <span className='shrink-0'>{TYPE_ICON[getFileType(s.file.name)]}</span>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs font-medium text-foreground'>{s.file.name}</p>
                      <p className='text-[10px] text-muted-foreground'>{formatSize(s.file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeStaged(s.key)}
                      disabled={uploadMutation.isLoading}
                      className='rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-40'
                      title='Bỏ file này'
                    >
                      <XIcon className='h-3.5 w-3.5' />
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
          <Button
            size='sm'
            className='h-8 gap-1.5 text-xs'
            onClick={handleConfirmUpload}
            disabled={staged.length === 0 || uploadMutation.isLoading}
          >
            {uploadMutation.isLoading ? (
              <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <UploadCloudIcon className='h-3.5 w-3.5' />
            )}
            {uploadMutation.isLoading
              ? 'Đang tải lên...'
              : `Xác nhận tải lên${staged.length ? ` (${staged.length})` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChiHoUploadModal;
