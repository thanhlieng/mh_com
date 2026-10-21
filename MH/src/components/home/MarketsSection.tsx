import { useReducedMotion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent, MarketItem } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/** Khung bản đồ — trùng viewBox của `public/images/markets/world-dots.svg`. */
const MAP_W = 1000;
const MAP_H = 419;

/**
 * Vùng hiển thị — cắt bớt rìa trái (Đại Tây Dương), phải và cực Nam không có
 * thị trường để phóng to cụm Đông Á, nơi các điểm nằm sát nhau.
 */
const VIEW = { x: 70, y: 22, w: 860, h: 350 };

/**
 * Tham số phép chiếu Natural Earth, PHẢI khớp script đã sinh `world-dots.svg`
 * (d3 geoNaturalEarth1, tâm kinh tuyến 150°E, fitWidth 1000, cắt từ vĩ độ
 * 78°B xuống 56°N). Đổi bản đồ nền thì sinh lại cả hai cùng lúc.
 */
const PROJ = { center: 150, scale: 182.7896, tx: 500, ty: 239.7251 };

/** Điểm gốc: cảng Hải Phòng. */
const ORIGIN_LONLAT: [number, number] = [106.7, 20.85];

const RAD = Math.PI / 180;

/** Chiếu kinh/vĩ độ lên khung SVG — công thức Natural Earth I như d3-geo. */
function project(lon: number, lat: number): [number, number] {
  const lambda = ((((lon - PROJ.center + 540) % 360) + 360) % 360 - 180) * RAD;
  const phi = lat * RAD;
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  const x =
    lambda *
    (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4)));
  const y =
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)));
  return [PROJ.tx + PROJ.scale * x, PROJ.ty - PROJ.scale * y];
}

const ORIGIN = project(...ORIGIN_LONLAT);

/** Đường cong từ Việt Nam tới thị trường, vồng lên phía trên theo độ dài tuyến. */
function routePath([x, y]: [number, number]) {
  const [ox, oy] = ORIGIN;
  const dist = Math.hypot(x - ox, y - oy);
  const cx = (ox + x) / 2;
  const cy = (oy + y) / 2 - Math.min(dist * 0.3, 120);
  return `M ${ox} ${oy} Q ${cx} ${cy} ${x} ${y}`;
}

const LABEL_FONT = 14;
const LABEL_H = 28;

/** Nhãn dạng viên thuốc quanh một điểm; rộng ước theo số ký tự. */
function MapLabel({
  x,
  y,
  text,
  side = 'top',
  tone = 'market',
}: {
  x: number;
  y: number;
  text: string;
  side?: MarketItem['labelSide'];
  tone?: 'market' | 'origin';
}) {
  const w = text.length * 8 + 22;
  const gap = 12;
  let lx = x - w / 2;
  let ly = y - gap - LABEL_H;
  if (side === 'bottom') ly = y + gap;
  if (side === 'left') {
    lx = x - gap - w;
    ly = y - LABEL_H / 2;
  }
  if (side === 'right') {
    lx = x + gap;
    ly = y - LABEL_H / 2;
  }

  return (
    <g>
      <rect
        x={lx}
        y={ly}
        width={w}
        height={LABEL_H}
        rx={LABEL_H / 2}
        fill={tone === 'origin' ? '#1AA851' : '#082238'}
        stroke={tone === 'origin' ? '#64D18C' : '#3F93D7'}
        strokeOpacity={tone === 'origin' ? 0.9 : 0.55}
      />
      <text
        x={lx + w / 2}
        y={ly + LABEL_H / 2 + LABEL_FONT * 0.36}
        textAnchor='middle'
        fontSize={LABEL_FONT}
        fontFamily='"Be Vietnam Pro", sans-serif'
        fontWeight={600}
        fill='#FFFFFF'
      >
        {text}
      </text>
    </g>
  );
}

/**
 * Mục 1.5 của spec — "Bản đồ toàn cầu từ Việt Nam toả ra các thị trường".
 *
 * Nền là bản đồ thế giới dạng lưới chấm (dữ liệu Natural Earth, sinh sẵn
 * thành `world-dots.svg`), thị trường đặt theo kinh/vĩ độ thật. Mỗi tuyến là
 * một đường cong có dòng chảy và "gói hàng" chạy từ Việt Nam ra thị trường.
 * Hover vào thị trường (trên bản đồ hoặc danh sách bên dưới) để làm nổi tuyến.
 * Trên mobile nhãn trong bản đồ quá nhỏ nên được ẩn — danh sách bên dưới thay thế.
 */
export function MarketsSection({ markets }: { markets: HomeContent['markets'] }) {
  const { lang } = useTranslation('common');
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  const points = markets.items.map((m) => project(m.lon, m.lat));
  const dimmed = (i: number) => active !== null && active !== i;

  return (
    <section className='relative overflow-hidden bg-navy-500 py-20 text-white tab:py-24'>
      {/* Quầng màu thương hiệu trên nền tối */}
      <div aria-hidden className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-brand-green-500/15 blur-3xl' />
        <div className='absolute -right-32 bottom-0 h-[480px] w-[480px] rounded-full bg-brand-blue-500/20 blur-3xl' />
      </div>

      <Container className='relative'>
        <Reveal>
          <SectionHeading
            tone='light'
            eyebrow={pickLang(markets.eyebrow, lang)}
            title={pickLang(markets.heading, lang)}
            description={pickLang(markets.description, lang)}
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className='relative mt-10 overflow-hidden rounded-lg border border-white/10 bg-navy-600/70 p-2 shadow-lift tab:p-5'
        >
          <svg
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            className='h-auto w-full'
            role='img'
            aria-label={pickLang(markets.description, lang)}
          >
            <defs>
              <linearGradient id='route-ltr' x1='0' y1='0' x2='1' y2='0'>
                <stop offset='0%' stopColor='#39BE69' />
                <stop offset='100%' stopColor='#6FAEE1' />
              </linearGradient>
              <linearGradient id='route-rtl' x1='1' y1='0' x2='0' y2='0'>
                <stop offset='0%' stopColor='#39BE69' />
                <stop offset='100%' stopColor='#6FAEE1' />
              </linearGradient>
              <filter id='route-glow' x='-20%' y='-20%' width='140%' height='140%'>
                <feGaussianBlur stdDeviation='3' />
              </filter>
              <radialGradient id='origin-halo'>
                <stop offset='0%' stopColor='#39BE69' stopOpacity='0.55' />
                <stop offset='100%' stopColor='#39BE69' stopOpacity='0' />
              </radialGradient>
            </defs>

            <image href='/images/markets/world-dots.svg' x='0' y='0' width={MAP_W} height={MAP_H} />

            {/* Tuyến vận chuyển */}
            {points.map((p, i) => {
              const d = routePath(p);
              const stroke = `url(#${p[0] >= ORIGIN[0] ? 'route-ltr' : 'route-rtl'})`;
              return (
                <g
                  key={markets.items[i].name.en}
                  className='transition-opacity duration-300'
                  opacity={dimmed(i) ? 0.18 : 1}
                >
                  <path d={d} fill='none' stroke={stroke} strokeWidth={6} opacity={0.35} filter='url(#route-glow)' />
                  <path id={`market-route-${i}`} d={d} fill='none' stroke={stroke} strokeWidth={active === i ? 2.6 : 1.8} />
                  {!reduceMotion && (
                    <>
                      <path d={d} fill='none' stroke='#FFFFFF' strokeOpacity={0.7} strokeWidth={1.2} strokeDasharray='2 14' strokeLinecap='round'>
                        <animate attributeName='stroke-dashoffset' from='0' to='-32' dur='1.4s' repeatCount='indefinite' />
                      </path>
                      <circle r={3.6} fill='#FFFFFF'>
                        <animateMotion dur={`${3.2 + i * 0.35}s`} begin={`${i * 0.4}s`} repeatCount='indefinite'>
                          <mpath href={`#market-route-${i}`} />
                        </animateMotion>
                      </circle>
                    </>
                  )}
                </g>
              );
            })}

            {/* Điểm thị trường */}
            {points.map(([x, y], i) => {
              const m = markets.items[i];
              return (
                <g
                  key={`pt-${m.name.en}`}
                  className='cursor-pointer transition-opacity duration-300'
                  opacity={dimmed(i) ? 0.35 : 1}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                >
                  <circle cx={x} cy={y} r={14} fill='#3F93D7' fillOpacity={active === i ? 0.35 : 0.18} />
                  <circle cx={x} cy={y} r={5.5} fill='#FFFFFF' stroke='#3F93D7' strokeWidth={2.5} />
                  <g className='hidden tab:block'>
                    <MapLabel x={x} y={y} text={pickLang(m.name, lang)} side={m.labelSide} />
                  </g>
                </g>
              );
            })}

            {/* Việt Nam — điểm gốc */}
            <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r={34} fill='url(#origin-halo)' />
            {!reduceMotion && (
              <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r={8} fill='none' stroke='#39BE69' strokeWidth={2}>
                <animate attributeName='r' from='8' to='26' dur='2.2s' repeatCount='indefinite' />
                <animate attributeName='stroke-opacity' from='0.9' to='0' dur='2.2s' repeatCount='indefinite' />
              </circle>
            )}
            <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r={8} fill='#1AA851' stroke='#FFFFFF' strokeWidth={2.5} />
            <g className='hidden tab:block'>
              <MapLabel x={ORIGIN[0]} y={ORIGIN[1]} text={pickLang(markets.origin, lang)} side='right' tone='origin' />
            </g>
          </svg>
        </Reveal>

        {/* Danh sách thị trường — hover để làm nổi tuyến trên bản đồ */}
        <Reveal delay={0.15}>
          <ul className='mt-6 grid grid-cols-2 gap-3 tab:grid-cols-4 lap:grid-cols-7'>
            {markets.items.map((m, i) => (
              <li key={`chip-${m.name.en}`}>
                <button
                  type='button'
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors duration-200',
                    active === i
                      ? 'border-brand-blue-300 bg-white/10'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/25'
                  )}
                >
                  <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue-500/30 font-display text-xs font-bold text-brand-blue-100'>
                    {i + 1}
                  </span>
                  <span className='font-display text-sm font-semibold text-white'>
                    {pickLang(m.name, lang)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
