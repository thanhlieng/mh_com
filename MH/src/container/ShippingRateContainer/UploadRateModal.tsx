/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

// Cột template để khách điền giá
const TEMPLATE_HEADERS = [
  'Mã tuyến',
  'Điểm đi',
  'Điểm đến',
  'Loại phương tiện',
  'Đơn vị tính',
  'Đơn giá (VND)',
  'Ngày áp dụng (YYYY-MM-DD)',
];

const TEMPLATE_SAMPLE = [
  'TR-HCM-HN',
  'Hồ Chí Minh',
  'Hà Nội',
  'Xe tải 5 tấn',
  'Chuyến',
  '12000000',
  '2024-01-01',
];

const ACCEPTED_EXT = ['xls', 'xlsx', 'csv'];
const ACCEPT_ATTR =
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  '.csv';

function isAccepted(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXT.includes(ext);
}

interface UploadRateModalProps {
  onClose: () => void;
  onUploaded: (file: File) => void;
}

export function UploadRateModal({ onClose, onUploaded }: UploadRateModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!isAccepted(f.name)) {
      setError('Chỉ chấp nhận file Excel (.xls, .xlsx) hoặc .csv');
      return;
    }
    setError('');
    setFile(f);
  };

  // Tạo & tải template CSV (mở được bằng Excel) — chạy hoàn toàn ở client
  const handleDownloadTemplate = () => {
    const rows = [TEMPLATE_HEADERS, TEMPLATE_SAMPLE];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    // BOM để Excel đọc đúng tiếng Việt
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau-gia-van-chuyen.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      // TODO: gọi uploadShippingRates(file) khi backend sẵn sàng
      await new Promise((r) => setTimeout(r, 500));
      onUploaded(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      {/* Modal */}
      <div className='relative flex w-full max-w-md flex-col rounded-lg bg-background shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-5 py-3'>
          <h2 className='text-sm font-semibold'>Upload giá vận chuyển mới</h2>
          <button
            onClick={onClose}
            className='rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground'
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className='flex flex-col gap-3 px-5 py-4'>
          {/* Tải template */}
          <div className='flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2.5'>
            <div className='min-w-0'>
              <p className='text-xs font-medium text-foreground'>
                Chưa có file mẫu?
              </p>
              <p className='text-[11px] text-muted-foreground'>
                Tải template về, điền giá rồi tải lên.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='h-8 shrink-0 gap-1.5 text-xs'
              onClick={handleDownloadTemplate}
            >
              <DownloadIcon className='h-3.5 w-3.5' />
              Tải template
            </Button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-6 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/10'
            )}
          >
            {file ? (
              <>
                <FileSpreadsheetIcon className='h-8 w-8 text-green-600' />
                <p className='break-all text-xs font-medium text-foreground'>
                  {file.name}
                </p>
                <button
                  onClick={() => setFile(null)}
                  className='text-[11px] text-muted-foreground underline hover:text-foreground'
                >
                  Chọn file khác
                </button>
              </>
            ) : (
              <>
                <UploadCloudIcon className='h-8 w-8 text-muted-foreground' />
                <p className='text-xs font-medium text-foreground'>
                  Kéo thả file vào đây hoặc
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1.5 text-xs'
                  onClick={() => inputRef.current?.click()}
                >
                  <UploadCloudIcon className='h-3.5 w-3.5' />
                  Chọn file
                </Button>
                <p className='text-[11px] text-muted-foreground'>
                  Hỗ trợ .xlsx, .xls, .csv
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type='file'
              accept={ACCEPT_ATTR}
              className='hidden'
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          {error && <p className='text-xs text-red-600'>{error}</p>}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-2 border-t border-border px-5 py-3'>
          <Button
            variant='outline'
            size='sm'
            className='h-8 text-xs'
            onClick={onClose}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            size='sm'
            className='h-8 gap-1.5 text-xs'
            onClick={handleSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <UploadCloudIcon className='h-3.5 w-3.5' />
            )}
            {isUploading ? 'Đang tải lên...' : 'Tải lên'}
          </Button>
        </div>
      </div>
    </div>
  );
}
