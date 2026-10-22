import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

import { RevealGroup, revealItemVariants } from '@/components/ui/Reveal';

import { AboutValue } from '@/content/about.content';
import { pickLang } from '@/utils/pickLang';

const TONES = [
  { ring: 'stroke-brand-green-500', fill: 'fill-brand-green-500', chip: 'bg-brand-green-50 text-brand-green-600', bar: 'bg-brand-green-500' },
  { ring: 'stroke-brand-blue-500', fill: 'fill-brand-blue-500', chip: 'bg-brand-blue-50 text-brand-blue-600', bar: 'bg-brand-blue-500' },
  { ring: 'stroke-brand-teal-500', fill: 'fill-brand-teal-500', chip: 'bg-brand-teal-50 text-brand-teal-600', bar: 'bg-brand-teal-500' },
];

/**
 * Ba giá trị cốt lõi — spec (mục 2.2) yêu cầu "tượng hình 3 vòng tròn liên kết
 * với nhau", nên phần hình là ba vòng tròn giao nhau kiểu biểu đồ Venn, mỗi
 * vòng mang một cặp từ khoá; phần dưới là ba thẻ diễn giải đầy đủ.
 *
 * Hình vẽ bằng SVG nên sắc nét ở mọi kích cỡ và không cần ảnh.
 */
export function CoreValues({ items }: { items: AboutValue[] }) {
  const { lang } = useTranslation('common');

  return (
    <div>
      {/* Ba vòng tròn giao nhau */}
      <div className='mx-auto max-w-xl'>
        <svg viewBox='0 0 300 240' className='h-auto w-full' role='img' aria-hidden>
          <g fillOpacity='0.08' strokeWidth='1.6'>
            <circle cx='150' cy='88' r='74' className='fill-brand-green-500 stroke-brand-green-500' />
            <circle cx='108' cy='158' r='74' className='fill-brand-blue-500 stroke-brand-blue-500' />
            <circle cx='192' cy='158' r='74' className='fill-brand-teal-500 stroke-brand-teal-500' />
          </g>

          {[
            { x: 150, y: 56, tone: 'fill-brand-green-600', value: items[0] },
            { x: 86, y: 182, tone: 'fill-brand-blue-600', value: items[1] },
            { x: 214, y: 182, tone: 'fill-brand-teal-600', value: items[2] },
          ].map(
            ({ x, y, tone, value }) =>
              value && (
                <text
                  key={value.pair.en}
                  x={x}
                  y={y}
                  textAnchor='middle'
                  fontSize='13'
                  fontFamily='"Be Vietnam Pro", sans-serif'
                  fontWeight={600}
                  className={tone}
                >
                  {pickLang(value.pair, lang).split(' - ').map((word, i) => (
                    <tspan key={i} x={x} dy={i === 0 ? 0 : 16}>
                      {word}
                    </tspan>
                  ))}
                </text>
              )
          )}
        </svg>
      </div>

      {/* Ba thẻ diễn giải */}
      <RevealGroup className='mt-10 grid grid-cols-1 gap-6 tab:grid-cols-3'>
        {items.map((item, i) => {
          const tone = TONES[i % TONES.length];
          return (
            <motion.div
              key={item.title.en}
              variants={revealItemVariants}
              className='relative overflow-hidden rounded-md border border-surface-line bg-white p-6 shadow-soft transition-shadow hover:shadow-lift'
            >
              <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
              <span
                className={`inline-flex rounded px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wide ${tone.chip}`}
              >
                {pickLang(item.pair, lang)}
              </span>
              <h3 className='mt-3 font-display text-base font-semibold text-navy-600'>
                {pickLang(item.title, lang)}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-ink-soft'>
                {pickLang(item.detail, lang)}
              </p>
            </motion.div>
          );
        })}
      </RevealGroup>
    </div>
  );
}
