import { Tabs } from 'antd';
import * as React from 'react';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';

import QualityReportsTable from './QualityReportsTable';

/**
 * Màn "Báo cáo chất lượng" phía NCC (mhcom).
 * - Tab "Báo cáo đã gửi"  → các báo cáo NCC tự tạo (source='ncc').
 *                           NCC có thể sửa/xóa khi đang ở trạng thái 'Đã gửi'.
 * - Tab "Báo cáo đã nhận" → các báo cáo MHVN/GP tạo cho NCC (source='mhvn').
 *                           NCC có thể chuyển trạng thái sang
 *                           'Đã tiếp nhận'/'Đã xử lý'/'Từ chối xử lý'.
 *
 * Filter: thời gian (ngày phát sinh), trạng thái, mức độ ảnh hưởng.
 * Pagination: page + page_size (10/20/50/100).
 */
const QualityReportsContainer: React.FC = () => {
  const [tab, setTab] = React.useState<'sent' | 'received'>('sent');

  return (
    <div className='space-y-4 p-4 md:p-6'>
      <div>
        <h1 className='text-xl font-semibold'>Báo cáo chất lượng</h1>
        <p className='text-sm text-muted-foreground'>
          Gửi báo cáo sự cố tới MHVN/GP và tiếp nhận yêu cầu xử lý từ MHVN/GP.
        </p>
      </div>

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as 'sent' | 'received')}
        items={[
          {
            key: 'sent',
            label: 'Báo cáo đã gửi',
            children: <QualityReportsTable tab='sent' />,
          },
          {
            key: 'received',
            label: 'Báo cáo đã nhận',
            children: <QualityReportsTable tab='received' />,
          },
        ]}
      />
    </div>
  );
};

export default withPrivateRouteSupplier(QualityReportsContainer);
