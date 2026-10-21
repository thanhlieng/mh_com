import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/** Vị trí Việt Nam trên khung bản đồ (toạ độ % như các thị trường khác). */
const ORIGIN = { x: 79, y: 52 };

/**
 * Mục 1.5 của spec — "Bản đồ toàn cầu từ Việt Nam toả ra các thị trường".
 *
 * Bản đồ là hình nền trang trí dạng lưới chấm (dot grid) chứ không phải bản đồ
 * địa lý chính xác: toạ độ trong `content.markets.items` là vị trí tương đối
 * trên khung phẳng, đủ để thể hiện hướng toả mà không ngụ ý độ chính xác bản đồ.
 * Mỗi tuyến là một đường cong vẽ dần từ Việt Nam ra thị trường đích.
 */
export function MarketsSection({ markets }: { markets: HomeContent['markets'] }) {
  const { lang } = useTranslation('common');

  // Đường cong bezier từ Việt Nam tới từng thị trường, vồng lên phía trên.
  const arc = (x: number, y: number) => {
    const mx = (ORIGIN.x + x) / 2;
    const my = (ORIGIN.y + y) / 2 - Math.abs(ORIGIN.x - x) * 0.28;
    return `M ${ORIGIN.x} ${ORIGIN.y} Q ${mx} ${my} ${x} ${y}`;
  };

  return (
    <section className='relative overflow-hidden py-20 tab:py-24'>
      <SectionGlow />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pickLang(markets.eyebrow, lang)}
            title={pickLang(markets.heading, lang)}
            description={pickLang(markets.description, lang)}
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className='relative mt-10 overflow-hidden rounded-md border border-surface-line bg-white p-4 shadow-soft tab:p-6'
        >
          <span
            aria-hidden
            className='absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-green-500 via-brand-blue-500 to-brand-teal-500'
          />

          <svg
            viewBox='0 0 100 62'
            className='h-auto w-full'
            role='img'
            aria-label={pickLang(markets.description, lang)}
          >
            <defs>
              {/* Lưới chấm làm nền — gợi hình bản đồ thế giới mà không vẽ biên giới. */}
              <pattern id='market-dots' width='1.6' height='1.6' patternUnits='userSpaceOnUse'>
                <circle cx='0.8' cy='0.8' r='0.26' fill='#C7D6E3' />
              </pattern>
            </defs>

            <rect x='0' y='0' width='100' height='62' rx='2' fill='#F6F9FB' />
            <rect x='3' y='5' width='94' height='50' fill='url(#market-dots)' opacity='0.85' />

            {/* Tuyến toả từ Việt Nam */}
            <g fill='none' stroke='#1769B3' strokeOpacity='0.45' strokeWidth='0.45' strokeDasharray='1.4 1'>
              {markets.items.map((m, i) => (
                <path
                  key={m.name.en}
                  d={arc(m.x, m.y)}
                  className='animate-draw-line'
                  style={{ strokeDashoffset: 0, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </g>

            {/* Các thị trường đích */}
            {markets.items.map((m) => (
              <g key={`dot-${m.name.en}`}>
                <circle cx={m.x} cy={m.y} r='0.9' fill='#1769B3' />
                <text
                  x={m.x}
                  y={m.y - 2}
                  textAnchor='middle'
                  fontSize='2.3'
                  fontFamily='"Be Vietnam Pro", sans-serif'
                  fontWeight={500}
                  fill='#0A2A45'
                >
                  {pickLang(m.name, lang)}
                </text>
              </g>
            ))}

            {/* Việt Nam — điểm gốc, nhấn bằng màu xanh lá và vòng nhịp */}
            <circle
              cx={ORIGIN.x}
              cy={ORIGIN.y}
              r='1.5'
              fill='#1AA851'
              className='animate-pulse-dot'
              style={{ transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px` }}
            />
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r='1.5' fill='#1AA851' />
            <text
              x={ORIGIN.x}
              y={ORIGIN.y + 4}
              textAnchor='middle'
              fontSize='2.6'
              fontFamily='"Be Vietnam Pro", sans-serif'
              fontWeight={700}
              fill='#1AA851'
            >
              {pickLang(markets.origin, lang)}
            </text>
          </svg>
        </Reveal>
      </Container>
    </section>
  );
}
