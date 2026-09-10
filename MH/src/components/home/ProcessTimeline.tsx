import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

import { ProcessIcon } from '@/components/ui/ProcessIcon';
import { RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { ACCENT_CLASSES } from '@/components/ui/ServiceIcon';

import { ProcessStep, ServiceAccent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

interface ProcessTimelineProps {
  steps: ProcessStep[];
  accent?: ServiceAccent;
}

/**
 * Timeline quy trình — mỗi bước là một thẻ có icon minh hoạ, số thứ tự lớn
 * làm hoa văn nền và vạch nối giữa các thẻ, thay cách trình bày cũ chỉ có
 * số + chữ trên nền trắng.
 *
 * Dùng chung cho trang chủ (quy trình tổng quát) và cả 3 trang dịch vụ (quy
 * trình riêng, màu theo `accent`). Đánh số ở đây hợp lý vì đúng là một chuỗi
 * tuần tự khách hàng đi qua, không phải trang trí.
 *
 * Ngang trên desktop (lưới 5 cột), dọc trên mobile.
 */
export function ProcessTimeline({ steps, accent = 'brand-blue' }: ProcessTimelineProps) {
  const { lang } = useTranslation('common');
  const accentClasses = ACCENT_CLASSES[accent];

  return (
    <RevealGroup className='relative grid grid-cols-1 gap-4 tab:grid-cols-5'>
      {/* Vạch nối chạy ngang sau các thẻ (chỉ desktop). */}
      <span
        aria-hidden
        className='absolute inset-x-[10%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-surface-line to-transparent tab:block'
      />

      {steps.map((step) => (
        <motion.div
          key={step.step}
          variants={revealItemVariants}
          className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-surface-line bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift'
        >
          {/* Số thứ tự cỡ lớn làm hoa văn nền — nhấn thứ tự mà không chiếm chỗ. */}
          <span
            aria-hidden
            className='pointer-events-none absolute -right-2 -top-3 font-display text-6xl font-extrabold text-navy-50 transition-colors duration-300 group-hover:text-paper'
          >
            {step.step}
          </span>

          <span
            className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${accentClasses.bg50} transition-colors duration-300 ${accentClasses.groupHoverBg500}`}
          >
            <ProcessIcon
              icon={step.icon}
              className={`h-6 w-6 ${accentClasses.text} transition-colors duration-300 group-hover:text-white`}
            />
          </span>

          <div className='relative mt-4 flex flex-1 flex-col'>
            {step.actor && (
              <span
                className={`mb-1.5 inline-flex w-fit rounded-full ${accentClasses.bg50} px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide ${accentClasses.text}`}
              >
                {pickLang(step.actor, lang)}
              </span>
            )}
            <h4 className='font-display text-base font-semibold text-navy-600'>
              {pickLang(step.title, lang)}
            </h4>
            <p className='mt-1.5 text-sm leading-relaxed text-ink-soft'>
              {pickLang(step.detail, lang)}
            </p>
          </div>

          {/* Vạch màu ở đáy thẻ, sáng lên khi hover. */}
          <span
            aria-hidden
            className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 ${accentClasses.bg500} transition-transform duration-300 group-hover:scale-x-100`}
          />
        </motion.div>
      ))}
    </RevealGroup>
  );
}
