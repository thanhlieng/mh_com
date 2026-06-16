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

import { importSupplierPrices } from '@/services/supplier.services';

const ROUTE_TYPE_OPTIONS = [
  { value: 'DOMESTIC', label: 'Nội địa (tỉnh → tỉnh)' },
  { value: 'DOMESTIC_PORT', label: 'Cảng ↔ Nội địa' },
];

// File mẫu tĩnh đặt trong public/assets — Next.js serve tại /assets/...
const TEMPLATE_FILE_URL = '/assets/de-nghi-bao-gia.xlsx';

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
  /** Gọi sau khi import thành công (số yêu cầu PENDING vừa tạo). */
  onUploaded: (created: number) => void;
}

export function UploadRateModal({ onClose, onUploaded }: UploadRateModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [routeType, setRouteType] = React.useState('DOMESTIC');
  const [currencyId, setCurrencyId] = React.useState('');
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

  // Tải file mẫu "Đề nghị báo giá" (.xlsx tĩnh trong public/assets)
  const handleDownloadTemplate = () => {
    const a = document.createElement('a');
    a.href = TEMPLATE_FILE_URL;
    a.download = 'de-nghi-bao-gia.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (!currencyId.trim()) {
      setError('Vui lòng nhập mã tiền tệ (currency id).');
      return;
    }
    setError('');
    setIsUploading(true);
    try {
      const res = await importSupplierPrices(file, routeType, currencyId.trim());
      onUploaded(res?.created ?? 0);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          'Upload thất bại. Vui lòng kiểm tra lại file.',
      );
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

          {/* Tham số import (backend yêu cầu) */}
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col gap-1'>
              <label className='text-[11px] font-medium text-muted-foreground'>
                Loại tuyến
              </label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value)}
                className='h-8 rounded-md border border-border bg-background px-2 text-xs'
              >
                {ROUTE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-[11px] font-medium text-muted-foreground'>
                Mã tiền tệ (currency id)
              </label>
              <input
                value={currencyId}
                onChange={(e) => setCurrencyId(e.target.value)}
                placeholder='VD: 1'
                inputMode='numeric'
                className='h-8 rounded-md border border-border bg-background px-2 text-xs'
              />
            </div>
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
