import { Modal } from 'antd';
import dayjs from 'dayjs';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';

import type { QualityReport } from '@/services/supplier.services';

import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from './types';

interface Props {
  open: boolean;
  report: QualityReport | null;
  onClose: () => void;
}

const fmtDate = (s: string | null | undefined) =>
  s ? dayjs(s).format('DD/MM/YYYY HH:mm') : '—';

const TextBlock: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div>
    <div className='mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
      {label}
    </div>
    {value ? (
      <div className='whitespace-pre-wrap rounded-md border border-border bg-muted/20 px-3 py-2 text-sm text-foreground'>
        {value}
      </div>
    ) : (
      <div className='italic text-sm text-muted-foreground/60'>—</div>
    )}
  </div>
);

const InlineField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <div className='mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
      {label}
    </div>
    <div className='text-sm text-foreground'>{children}</div>
  </div>
);

const QualityReportDetailModal: React.FC<Props> = ({
  open,
  report,
  onClose,
}) => {
  return (
    <Modal
      open={open}
      title='Chi tiết báo cáo chất lượng'
      onCancel={onClose}
      footer={null}
      width={820}
      destroyOnClose
    >
      {report ? (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <InlineField label='Ngày phát sinh'>
              <span className='tabular-nums'>
                {fmtDate(report.ngay_phat_sinh)}
              </span>
            </InlineField>
            <InlineField label='Mức độ'>
              <Badge variant={severityVariant(report.muc_do)}>
                {severityLabel(report.muc_do)}
              </Badge>
            </InlineField>
            <InlineField label='Khách hàng'>
              {report.khach_hang || '—'}
            </InlineField>
            <InlineField label='Trạng thái'>
              <Badge variant={statusVariant(report.trang_thai)}>
                {statusLabel(report.trang_thai)}
              </Badge>
            </InlineField>
            <InlineField label='Deadline xử lý'>
              <span className='tabular-nums'>
                {fmtDate(report.deadline_xu_ly)}
              </span>
            </InlineField>
            <InlineField label='Ngày hoàn thành'>
              <span className='tabular-nums'>
                {fmtDate(report.ngay_hoan_thanh)}
              </span>
            </InlineField>
          </div>

          <TextBlock label='Mô tả lỗi' value={report.mo_ta_loi} />
          <TextBlock
            label='Ảnh hưởng cụ thể'
            value={report.anh_huong_cu_the}
          />
          <TextBlock
            label='Nguyên nhân gốc rễ'
            value={report.nguyen_nhan_goc_re}
          />
          <TextBlock
            label='Biện pháp khắc phục'
            value={report.bien_phap_khac_phuc}
          />
          <TextBlock
            label='Biện pháp phòng ngừa'
            value={report.bien_phap_phong_ngua}
          />
          <TextBlock label='Ghi chú' value={report.ghi_chu} />

          <div className='grid grid-cols-2 gap-4 border-t border-border pt-3'>
            <InlineField label='Người tạo'>
              {report.created_by_label || '—'}
            </InlineField>
            <InlineField label='Ngày tạo'>
              <span className='tabular-nums'>{fmtDate(report.created_at)}</span>
            </InlineField>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default QualityReportDetailModal;
