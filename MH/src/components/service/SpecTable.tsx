import useTranslation from 'next-translate/useTranslation';

import { Reveal } from '@/components/ui/Reveal';
import { ACCENT_CLASSES } from '@/components/ui/ServiceIcon';

import { ServiceAccent, SpecRow } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Bảng thông số dịch vụ — khác nhau giữa 3 trang (tuyến/loại xe/tải trọng
 * cho đường bộ; cảng/FCL-LCL/lịch tàu cho đường biển; loại hình tờ khai/
 * chứng từ/thời gian xử lý cho hải quan), nhưng dùng chung component này.
 * Cuộn ngang trong khung riêng trên mobile — thân trang không bao giờ cuộn ngang.
 */
export function SpecTable({ rows, accent = 'brand-blue' }: { rows: SpecRow[]; accent?: ServiceAccent }) {
  const { lang } = useTranslation('common');
  const bar = ACCENT_CLASSES[accent].bg500;

  return (
    <Reveal className='relative overflow-hidden rounded-2xl border border-surface-line bg-white shadow-soft'>
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
      <table className='w-full min-w-[480px] border-collapse font-display text-sm'>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors hover:bg-paper ${i !== rows.length - 1 ? 'border-b border-surface-line' : ''}`}
            >
              <th
                scope='row'
                className='w-2/5 whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft'
              >
                {pickLang(row.label, lang)}
              </th>
              <td className='px-5 py-4 text-navy-600' style={{ fontVariantNumeric: 'tabular-nums' }}>
                {pickLang(row.value, lang)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}
