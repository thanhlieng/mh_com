/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ClipboardListIcon,
  FileTextIcon,
  HandCoinsIcon,
  LogOutIcon,
  RouteIcon,
  TruckIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type CSSProperties,useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import TargetSwitcher from '@/components/TargetSwitcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useAppDispatch, useAppSelector } from '@/store/hook';
import { clearActiveTarget } from '@/store/slices/activeTargetSlice';

import { ACTIVE_A_TARGET, USER } from '@/contants/Storage';
import { useQualityReportNewCount } from '@/hook/useQualityReportNewMarker';
import {
  SUPPLIER_COST_STATEMENT,
  SUPPLIER_PAYMENT_MANAGEMENT,
  SUPPLIER_QUALITY_REPORTS,
  SUPPLIER_SHIPPING_RATE,
} from '@/routes/routes';
import storage from '@/utils/storage';

/**
 * Bảng màu sidebar theo hệ thống đang chọn.
 * - `gp`: giữ nguyên tông mặc định (token `--sidebar-*` trong globals.css).
 * - `mhvn`: đổi sang tông xanh #1DA553 (hsl 144 70% 38%). Giữ cùng cấu trúc
 *   sáng/tối như tông gp (nền tối, primary nổi) nhưng theo hue xanh lá.
 * Override bằng cách set lại các CSS variable `--sidebar-*` ngay trên <aside>;
 * mọi class `bg-sidebar`/`text-sidebar-primary`/... sẽ tự đổi theo.
 */
const MHVN_SIDEBAR_VARS: CSSProperties = {
  ['--sidebar-background' as never]: '153 45% 10%',
  ['--sidebar-foreground' as never]: '150 25% 91%',
  ['--sidebar-primary' as never]: '145 63% 45%',
  ['--sidebar-primary-foreground' as never]: '0 0% 100%',
  ['--sidebar-accent' as never]: '152 40% 17%',
  ['--sidebar-accent-foreground' as never]: '150 25% 91%',
  ['--sidebar-border' as never]: '152 40% 17%',
  ['--sidebar-ring' as never]: '144 70% 38%',
};

const NAV_ITEMS = [
  {
    label: 'Bảng kê chi phí & chi hộ',
    href: SUPPLIER_COST_STATEMENT,
    icon: FileTextIcon,
  },
  {
    label: 'Quản lý chi hộ',
    href: SUPPLIER_PAYMENT_MANAGEMENT,
    icon: HandCoinsIcon,
  },
  {
    // "Yêu cầu thay đổi giá" đã gộp thành tab trong màn này.
    label: 'Thiết lập giá vận chuyển',
    href: SUPPLIER_SHIPPING_RATE,
    icon: RouteIcon,
  },
  {
    label: 'Báo cáo chất lượng',
    href: SUPPLIER_QUALITY_REPORTS,
    icon: ClipboardListIcon,
  },
];

interface SupplierSidebarProps {
  /** Trạng thái mở drawer trên mobile/tablet */
  open?: boolean;
  /** Đóng drawer (mobile/tablet) */
  onClose?: () => void;
}

const readPersistedTarget = (): 'mhvn' | 'gp' | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ACTIVE_A_TARGET);
  return raw === 'mhvn' || raw === 'gp' ? raw : null;
};

const SupplierSidebar = ({ open = false, onClose }: SupplierSidebarProps) => {
  const router = useRouter();
  const { removeAll } = storage();
  const dispatch = useAppDispatch();
  const hasMultipleTargets = useAppSelector(
    (s) => s.activeTarget.availableTargets.length >= 2,
  );
  const storeCurrent = useAppSelector((s) => s.activeTarget.current);
  // Fallback localStorage qua useEffect (không phải useState initializer) —
  // tránh hydration mismatch SSR vs client khi store/localStorage có giá trị
  // khác null. Xem comment cùng pattern trong SupplierLayout.tsx.
  const [persistedCurrent, setPersistedCurrent] = useState<'mhvn' | 'gp' | null>(
    null,
  );
  useEffect(() => {
    setPersistedCurrent(readPersistedTarget());
  }, []);
  const currentSystem = storeCurrent ?? persistedCurrent;

  // Số báo cáo chất lượng MỚI (NCC chưa xem) — để hiện dot ở menu item.
  const qrNewCount = useQualityReportNewCount();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(USER);
    if (raw) {
      const user = JSON.parse(raw);
      setUsername(user?.username || '');
    }
  }, []);

  const handleLogout = () => {
    dispatch(clearActiveTarget());
    removeAll();
    router.push('/login-home');
  };

  return (
    <>
      {/* Backdrop — chỉ trên mobile/tablet khi drawer mở */}
      {open && (
        <div
          className='fixed inset-0 z-40 bg-black/40 md:hidden'
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        style={currentSystem === 'mhvn' ? MHVN_SIDEBAR_VARS : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200',
          'md:static md:z-auto md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
      {/* Brand */}
      <div className='flex h-16 items-center gap-3 px-5'>
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary'>
          <TruckIcon className='h-4 w-4 text-sidebar-primary-foreground' />
        </div>
        <span className='text-sm font-semibold tracking-wide text-sidebar-primary'>
          {currentSystem?.toLocaleUpperCase()} Supplier
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className='flex flex-1 flex-col gap-1 px-3 py-4'>
        <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40'>
          Menu
        </p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = router.pathname === href;
          // Chỉ menu "Báo cáo chất lượng" có dot khi có report mới chưa xem.
          const showNewDot =
            href === SUPPLIER_QUALITY_REPORTS && qrNewCount > 0 && !active;
          return (
            <Link key={href} href={href} passHref>
              <a
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <Icon className='h-4 w-4 shrink-0' />
                <span className='flex-1'>{label}</span>
                {showNewDot && (
                  <span
                    aria-label={`${qrNewCount} báo cáo mới`}
                    className='inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white'
                  >
                    {qrNewCount > 99 ? '99+' : qrNewCount}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Target Switcher — chỉ hiện khi account liên kết >= 2 hệ A */}
      {hasMultipleTargets && (
        <div className='px-3 pt-3'>
          <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40'>
            Hệ thống
          </p>
          <TargetSwitcher className='w-full' />
        </div>
      )}

      {/* User + Logout */}
      <div className='px-3 py-4'>
        <div className='mb-3 flex items-center gap-3 rounded-md px-3 py-2'>
          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold uppercase text-sidebar-primary'>
            {username.charAt(0) || 'U'}
          </div>
          <span className='truncate text-sm text-sidebar-foreground/80'>
            {username || 'Supplier'}
          </span>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          onClick={handleLogout}
        >
          <LogOutIcon className='h-4 w-4' />
          Đăng xuất
        </Button>
      </div>
      </aside>
    </>
  );
};

export default SupplierSidebar;
