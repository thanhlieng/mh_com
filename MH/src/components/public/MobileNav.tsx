import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';

import { CtaButton } from '@/components/ui/CtaButton';
import { ACCENT_CLASSES, ServiceIcon } from '@/components/ui/ServiceIcon';

import { serviceSummaries } from '@/content/services.content';
import { pickLang } from '@/utils/pickLang';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { href: '/about', label: { vi: 'Về MH', en: 'About' } },
  { href: '/tin-tuc', label: { vi: 'Tin tức', en: 'News' } },
  { href: '/customer-supports', label: { vi: 'Liên hệ', en: 'Contact' } },
];

/**
 * Drawer menu mobile cho trang public redesign — thay Drawer của antd trong
 * `container/banner` cũ, không kéo theo antd vào bundle code public mới.
 */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const { lang } = useTranslation('common');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[60] bg-navy-600/50 lap:hidden'
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
            className='fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col bg-white shadow-lift lap:hidden'
          >
            <div className='flex items-center justify-between border-b border-surface-line px-5 py-5'>
              <span className='font-display text-lg font-extrabold text-navy-600'>
                MH<span className='text-brand-green-500'>.</span>
              </span>
              <button
                type='button'
                onClick={onClose}
                aria-label={lang === 'en' ? 'Close menu' : 'Đóng menu'}
                className='rounded-full p-2 text-navy-500 hover:bg-navy-50'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <nav className='flex-1 overflow-y-auto px-5 py-6'>
              <p className='mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft'>
                {lang === 'en' ? 'Services' : 'Dịch vụ'}
              </p>
              <ul className='mb-6 flex flex-col gap-1'>
                {serviceSummaries.map((s) => {
                  const accent = ACCENT_CLASSES[s.accent];
                  return (
                    <li key={s.slug}>
                      <Link
                        href={`/dich-vu/${s.slug}`}
                        onClick={onClose}
                        legacyBehavior={false}
                        className='flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-paper'
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.bg50}`}>
                          <ServiceIcon icon={s.icon} className={`h-4 w-4 ${accent.text}`} />
                        </span>
                        <span className='font-display text-sm font-medium text-navy-600'>
                          {pickLang(s.title, lang)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <ul className='flex flex-col gap-1 border-t border-surface-line pt-4'>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className='block rounded-xl px-3 py-3 font-display text-sm font-medium text-navy-600 hover:bg-paper'
                    >
                      {pickLang(link.label, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className='flex items-center justify-between gap-3 border-t border-surface-line px-5 py-5'>
              <button
                type='button'
                onClick={() => setLanguage(lang === 'vi' ? 'en' : 'vi')}
                className='font-display text-sm font-semibold text-ink-soft'
              >
                {lang === 'vi' ? 'English' : 'Tiếng Việt'}
              </button>
              <CtaButton href='/login-home' size='md' showArrow={false} className='flex-1 justify-center'>
                {lang === 'en' ? 'Sign in' : 'Đăng nhập'}
              </CtaButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
