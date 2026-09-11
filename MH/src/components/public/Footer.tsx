import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { IS_DEMO } from '@/lib/demoMode';

import { Container } from '@/components/ui/Container';

import { contactContent } from '@/content/contact.content';
import { serviceSummaries } from '@/content/services.content';
import { pickLang } from '@/utils/pickLang';

// Mục "Tra cứu vận đơn" (/tracking) tạm ẩn theo yêu cầu — thêm lại vào mảng
// này khi bật lại tính năng tra cứu.
const TOOLS = [
  { href: '/customer-supports', label: { vi: 'Yêu cầu báo giá', en: 'Request a quote' } },
];

const COMPANY = [
  { href: '/about', label: { vi: 'Về MH', en: 'About MH' } },
  // `/recruitment` là trang cũ, cần API → ẩn ở chế độ demo.
  { href: '/recruitment', label: { vi: 'Tuyển dụng', en: 'Careers' }, needsApi: true },
  { href: '/customer-supports', label: { vi: 'Liên hệ', en: 'Contact' } },
].filter((item) => !(IS_DEMO && item.needsApi));

/**
 * Footer cho trang public redesign — nền navy đặc thay ảnh `footer-bg.jpg`
 * cũ, giữ cấu trúc quen thuộc (dịch vụ / công cụ / công ty / liên hệ) nhưng
 * dựng lại toàn bộ, không dùng lại `components/Footer` (CMS-driven, gắn với
 * HomeLayout của 13 trang public cũ).
 */
export function Footer() {
  const { lang } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer className='bg-navy-600 text-white'>
      <Container className='grid gap-10 py-16 tab:grid-cols-2 lap:grid-cols-4'>
        <div className='lap:col-span-1'>
          <span className='font-display text-xl font-bold'>
            MH<span className='text-brand-green-400'>.</span>
          </span>
          <p className='mt-4 max-w-xs text-sm leading-relaxed text-white/65'>
            {lang === 'en'
              ? 'Road freight, sea freight, and customs clearance through Hai Phong Port — connecting import–export businesses to the world.'
              : 'Vận chuyển đường bộ, đường biển và khai báo hải quan qua cảng Hải Phòng — kết nối doanh nghiệp xuất nhập khẩu đi khắp thế giới.'}
          </p>
          <div className='mt-5 flex items-center gap-3'>
            <a
              href='#'
              aria-label='Facebook'
              className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20'
            >
              {/* lucide-react 1.x không còn icon thương hiệu — vẽ tay glyph Facebook tối giản. */}
              <svg viewBox='0 0 24 24' className='h-4 w-4 fill-current' aria-hidden>
                <path d='M13.5 21v-7.8h2.62l.39-3.04h-3.01V8.24c0-.88.24-1.48 1.5-1.48h1.61V4.05C15.87 4.02 14.9 3.94 13.77 3.94c-2.34 0-3.94 1.43-3.94 4.05v2.17H7.2v3.04h2.63V21h3.67z' />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className='font-display text-xs font-semibold uppercase tracking-[0.14em] text-white/50'>
            {lang === 'en' ? 'Services' : 'Dịch vụ'}
          </p>
          <ul className='mt-4 flex flex-col gap-3'>
            {serviceSummaries.map((s) => (
              <li key={s.slug}>
                <Link legacyBehavior={false}
                  href={`/dich-vu/${s.slug}`}
                  className='text-sm text-white/75 transition-colors hover:text-white'
                >
                  {pickLang(s.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className='font-display text-xs font-semibold uppercase tracking-[0.14em] text-white/50'>
            {lang === 'en' ? 'Tools' : 'Công cụ'}
          </p>
          <ul className='mt-4 flex flex-col gap-3'>
            {TOOLS.map((item) => (
              <li key={item.href}>
                <Link legacyBehavior={false} href={item.href} className='text-sm text-white/75 transition-colors hover:text-white'>
                  {pickLang(item.label, lang)}
                </Link>
              </li>
            ))}
          </ul>
          <p className='mt-6 font-display text-xs font-semibold uppercase tracking-[0.14em] text-white/50'>
            {lang === 'en' ? 'Company' : 'Công ty'}
          </p>
          <ul className='mt-4 flex flex-col gap-3'>
            {COMPANY.map((item) => (
              <li key={item.href}>
                <Link legacyBehavior={false} href={item.href} className='text-sm text-white/75 transition-colors hover:text-white'>
                  {pickLang(item.label, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className='font-display text-xs font-semibold uppercase tracking-[0.14em] text-white/50'>
            {lang === 'en' ? 'Contact' : 'Liên hệ'}
          </p>
          <ul className='mt-4 flex flex-col gap-3 text-sm text-white/75'>
            {/* Nguồn duy nhất: src/content/contact.content.ts */}
            {contactContent.channels.map((channel) => {
              const Icon =
                channel.kind === 'phone' ? Phone : channel.kind === 'email' ? Mail : MapPin;
              return (
                <li key={channel.kind} className='flex items-start gap-2.5'>
                  <Icon className='mt-0.5 h-4 w-4 shrink-0 text-brand-green-400' aria-hidden />
                  {channel.href ? (
                    <a href={channel.href} className='hover:text-white'>
                      {channel.value}
                    </a>
                  ) : (
                    <span>{channel.value}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>

      <div className='border-t border-white/10'>
        <Container className='flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 tab:flex-row'>
          <span>© {year} MH Great Sun. {lang === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</span>
        </Container>
      </div>
    </footer>
  );
}
