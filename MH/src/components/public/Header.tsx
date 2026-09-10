import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';

import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ACCENT_CLASSES, ServiceIcon } from '@/components/ui/ServiceIcon';

import { serviceSummaries } from '@/content/services.content';
import { pickLang } from '@/utils/pickLang';

import { MobileNav } from './MobileNav';
import { TrackingBar } from './TrackingBar';

const NAV_LINKS = [
  { href: '/about', label: { vi: 'Về MH', en: 'About' } },
  { href: '/tin-tuc', label: { vi: 'Tin tức', en: 'News' } },
  { href: '/customer-supports', label: { vi: 'Liên hệ', en: 'Contact' } },
];

const SERVICES_LABEL = { vi: 'Dịch vụ', en: 'Services' };
const SIGN_IN_LABEL = { vi: 'Đăng nhập', en: 'Sign in' };

/**
 * Header cho trang public redesign. Trong suốt khi ở trên hero → nền navy ĐẶC
 * khi cuộn (không dùng nền trắng mờ + backdrop-blur nữa: nội dung cuộn phía
 * dưới lộ qua làm chữ header khó đọc). Chữ luôn trắng ở cả hai trạng thái nên
 * không còn cảnh chữ đổi màu giữa chừng.
 */
export function Header() {
  const { lang } = useTranslation('common');
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => setLanguage(lang === 'vi' ? 'en' : 'vi');

  const navItemClass =
    'rounded-full px-4 py-2.5 font-display text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white';

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 w-full transition-colors duration-300',
          scrolled ? 'bg-navy-600 shadow-lift' : 'bg-transparent',
        ].join(' ')}
      >
        {/* Dải nhấn màu thương hiệu ở đáy header khi cuộn. */}
        {scrolled && (
          <span
            aria-hidden
            className='absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-brand-green-500 via-brand-blue-500 to-brand-teal-500'
          />
        )}

        <Container className='flex h-20 items-center gap-4'>
          <Link href='/' className='mr-2 flex shrink-0 items-center'>
            <span className='font-display text-xl font-extrabold tracking-tight text-white'>
              MH<span className='text-brand-green-400'>.</span>
            </span>
          </Link>

          <nav className='hidden flex-1 items-center gap-2 lap:flex'>
            <div
              className='relative'
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type='button'
                className={`${navItemClass} flex items-center gap-1.5`}
                aria-expanded={servicesOpen}
              >
                {pickLang(SERVICES_LABEL, lang)}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className='absolute left-0 top-full w-[400px] pt-3'
                  >
                    <div className='grid gap-1 rounded-2xl border border-surface-line bg-white p-2 shadow-lift'>
                      {serviceSummaries.map((s) => {
                        const accent = ACCENT_CLASSES[s.accent];
                        return (
                          <Link
                            key={s.slug}
                            href={`/dich-vu/${s.slug}`}
                            legacyBehavior={false}
                            className='flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-paper'
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent.bg50}`}
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

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  navItemClass,
                  router.pathname === link.href ? 'bg-white/10 text-white' : '',
                ].join(' ')}
              >
                {pickLang(link.label, lang)}
              </Link>
            ))}
          </nav>

          <div className='ml-auto hidden items-center gap-4 lap:flex'>
            <AnimatePresence>
              {scrolled && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 250 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.25 }}
                  className='overflow-hidden'
                >
                  <TrackingBar variant='compact' />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vạch ngăn để nhóm điều hướng không dính liền nhóm hành động. */}
            <span aria-hidden className='h-6 w-px bg-white/20' />

            <button
              type='button'
              onClick={toggleLang}
              className='rounded-full px-2.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:bg-white/10 hover:text-white'
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>

            <CtaButton href='/login-home' size='md' variant='accent' showArrow={false}>
              {pickLang(SIGN_IN_LABEL, lang)}
            </CtaButton>
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
