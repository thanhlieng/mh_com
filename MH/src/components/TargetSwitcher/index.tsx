import { notification } from 'antd';

import { cn } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import type { ATarget } from '@/services/account-target.services';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setActiveTarget } from '@/store/slices/activeTargetSlice';

interface TargetSwitcherProps {
  /** Custom CSS class cho container ngoài cùng (vd: w-full để fit sidebar). */
  className?: string;
}

/**
 * Segmented control để chọn hệ A (mhvn / gp). Chỉ render khi account liên kết
 * với từ 2 hệ trở lên. Mỗi pill hiển thị tên hệ + badge số lượng entity liên
 * kết (NCC cho supplier, KH cho customer). Khi switch:
 *   - dispatch `setActiveTarget` (slice tự persist localStorage)
 *   - `queryClient.resetQueries()` để các màn hiện tại refetch với header X-A-Target mới
 *   - hiển thị notification confirm
 */
const TargetSwitcher: React.FC<TargetSwitcherProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { current, availableTargets, accountType } = useAppSelector(
    (state) => state.activeTarget,
  );

  if (availableTargets.length < 2 || !current) {
    return null;
  }

  const unitLabel = accountType === 'supplier' ? 'NCC' : 'KH';

  const handleSelect = (next: ATarget) => {
    if (next === current) return;
    dispatch(setActiveTarget(next));
    queryClient.resetQueries();
    notification.success({
      message: `Đã chuyển sang hệ ${next.toUpperCase()}`,
      placement: 'top',
      duration: 2,
    });
  };

  return (
    <div
      role='radiogroup'
      aria-label='Chọn hệ thống'
      className={cn(
        'inline-flex items-stretch gap-1 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-1',
        className,
      )}
    >
      {availableTargets.map((t) => {
        const active = t.a_target === current;
        return (
          <button
            key={t.a_target}
            type='button'
            role='radio'
            aria-checked={active}
            onClick={() => handleSelect(t.a_target)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            )}
          >
            <span className='tracking-wide'>{t.a_target.toUpperCase()}</span>
            {/* <span
              className={cn(
                'rounded-full px-1.5 text-[10px] font-medium leading-none',
                active
                  ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                  : 'bg-sidebar-accent text-sidebar-foreground/60',
              )}
            >
              {t.entity_ids.length} {unitLabel}
            </span> */}
          </button>
        );
      })}
    </div>
  );
};

export default TargetSwitcher;
