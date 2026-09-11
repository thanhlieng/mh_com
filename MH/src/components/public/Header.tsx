import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe, Mail, Menu as MenuIcon, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { IS_DEMO } from '@/lib/demoMode';

import { Container } from '@/components/ui/Container';
import { ACCENT_CLASSES, ServiceIcon } from '@/components/ui/ServiceIcon';

import { contactContent } from '@/content/contact.content';
import { serviceSummaries } from '@/content/services.content';
import { pickLang } from '@/utils/pickLang';

import { MobileNav } from './MobileNav';

const NAV_LINKS = [
  { href: '/about', label: { vi: 'Về MH', en: 'About' } },
  { href: '/tin-tuc', label: { vi: 'Tin tức', en: 'News' } },
  { href: '/customer-supports', label: { vi: 'Liên hệ', en: 'Contact' } },
];

const LABEL = {
  services: { vi: 'Dịch vụ', en: 'Services' },
  signIn: { vi: 'Đăng nhập', en: 'Sign in' },
  support: { vi: 'Hỗ trợ', en: 'Support' },
};

/**
 * Header trang public — học cấu trúc từ maersk.com: thanh nền ĐẶC hai tầng
 * (tầng tiện ích mảnh phía trên + tầng điều hướng chính), chữ thường không
 * bo pill, gạch chân màu cho mục đang mở.
 *
 * Nền đặc là bắt buộc, không phải lựa chọn thẩm mỹ: header nằm TRƯỚC <main>
 * trong luồng của `PublicLayout`, nên khi để `bg-transparent` nó lộ nền
 * `bg-paper` (gần trắng) của layout chứ không phải hero — chữ trắng trên nền
 * trắng, mất sạch thông tin ở đầu trang.
 */
export function Header() {
  const { lang } = useTranslation('common');
  const router = useRouter();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLang = () => setLanguage(lang === 'vi' ? 'en' : 'vi');
  const phone = contactContent.channels.find((c) => c.kind === 'phone');

  const navItem =
    'relative py-4 font-display text-[15px] font-normal text-white/85 transition-colors hover:text-white';

  return (
    <>
      <header className='sticky top-0 z-50 w-full bg-navy-600'>
        {/* Tầng 1 — tiện ích: ngôn ngữ, hỗ trợ, liên hệ nhanh. */}
        <div className='border-b border-white/10 bg-navy-700'>
          <Container className='flex h-10 items-center justify-end gap-6'>
            {phone?.href && (
              <a
                href={phone.href}
                className='hidden items-center gap-1.5 font-display text-xs text-white/60 transition-colors hover:text-white tab:flex'
              >
                <Phone className='h-3.5 w-3.5' aria-hidden />
                {phone.value}
              </a>
            )}
            <Link
              href='/customer-supports'
              className='hidden items-center gap-1.5 font-display text-xs text-white/60 transition-colors hover:text-white tab:flex'
              legacyBehavior={false}
            >
              <Mail className='h-3.5 w-3.5' aria-hidden />
              {pickLang(LABEL.support, lang)}
            </Link>
            <button
              type='button'
              onClick={toggleLang}
              className='flex items-center gap-1.5 font-display text-xs font-medium text-white/60 transition-colors hover:text-white'
            >
              <Globe className='h-3.5 w-3.5' aria-hidden />
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
          </Container>
        </div>

        {/* Tầng 2 — điều hướng chính. */}
        <Container className='flex h-16 items-center gap-8'>
          <Link legacyBehavior={false} href='/' className='flex shrink-0 items-center'>
            <span className='font-display text-xl font-bold tracking-tight text-white'>
              MH<span className='text-brand-green-400'>.</span>
            </span>
          </Link>

          <nav className='hidden flex-1 items-center gap-8 lap:flex'>
            <div
              className='relative'
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type='button'
                className={`${navItem} flex items-center gap-1.5`}
                aria-expanded={servicesOpen}
              >
                {pickLang(LABEL.services, lang)}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-brand-green-400 transition-opacity ${
                    servicesOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16 }}
                    className='absolute left-0 top-full w-[420px]'
                  >
                    <div className='mt-0 grid gap-0.5 rounded-md border border-surface-line bg-white p-2 shadow-lift'>
                      {serviceSummaries.map((s) => {
                        const accent = ACCENT_CLASSES[s.accent];
                        return (
                          <Link
                            key={s.slug}
                            href={`/dich-vu/${s.slug}`}
                            legacyBehavior={false}
                            className='flex items-start gap-3 rounded p-3 transition-colors hover:bg-paper'
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${accent.bg50}`}
                            >
                              <ServiceIcon icon={s.icon} className={`h-5 w-5 ${accent.text}`} />
                            </span>
                            <span>
                              <span className='block font-display text-sm font-semibold text-navy-600'>
                                {pickLang(s.title, lang)}
                              </span>
                              <span className='mt-0.5 block text-xs leading-snug text-ink-soft'>
                                {pickLang(s.tagline, lang)}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.map((link) => {
              const active = router.pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={navItem} legacyBehavior={false}>
                  {pickLang(link.label, lang)}
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 h-0.5 bg-brand-green-400 transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Chế độ demo: ẩn nút Đăng nhập vì `/login-home` cần API auth. */}
          <div className='ml-auto hidden items-center lap:flex'>
            {!IS_DEMO && (
            <Link
              href='/login-home'
              legacyBehavior={false}
              className='rounded bg-white px-5 py-2 font-display text-sm font-medium text-navy-600 transition-colors hover:bg-white/90'
            >
              {pickLang(LABEL.signIn, lang)}
            </Link>
            )}
          </div>

          <button
            type='button'
            className='-mr-2 ml-auto p-2 text-white lap:hidden'
            onClick={() => setMobileOpen(true)}
            aria-label={lang === 'en' ? 'Open menu' : 'Mở menu'}
          >
            <MenuIcon className='h-6 w-6' />
          </button>
        </Container>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
