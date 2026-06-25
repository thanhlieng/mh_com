import { notification, Select } from 'antd';
import { useMemo } from 'react';

import { queryClient } from '@/lib/queryClient';
import type { ATarget } from '@/services/account-target.services';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setActiveTarget } from '@/store/slices/activeTargetSlice';

interface TargetSwitcherProps {
  /** Custom CSS class for sizing/spacing */
  className?: string;
  /** Width của Select (px). Truyền `undefined` để Select tự fit container. */
  width?: number;
}

const TargetSwitcher: React.FC<TargetSwitcherProps> = ({
  className,
  width,
}) => {
  const dispatch = useAppDispatch();
  const { current, availableTargets, accountType } = useAppSelector(
    (state) => state.activeTarget,
  );

  // Chỉ hiển thị khi account liên kết với từ 2 target trở lên.
  const shouldRender = availableTargets.length >= 2;

  const options = useMemo(() => {
    const unitLabel = accountType === 'supplier' ? 'NCC' : 'KH';
    return availableTargets.map((t) => ({
      value: t.a_target,
      label: `${t.a_target.toUpperCase()} (${t.entity_ids.length} ${unitLabel})`,
    }));
  }, [availableTargets, accountType]);

  if (!shouldRender || !current) {
    return null;
  }

  const handleChange = (next: ATarget) => {
    if (next === current) return;
    dispatch(setActiveTarget(next));
    // Quan trọng: xoá cache để mọi query refetch với header X-A-Target mới.
    queryClient.clear();
    notification.success({
      message: `Đã chuyển sang hệ ${next.toUpperCase()}`,
      placement: 'top',
      duration: 2,
    });
  };

  return (
    <Select<ATarget>
      className={className}
      style={width ? { width } : undefined}
      value={current}
      onChange={handleChange}
      options={options}
      size='middle'
    />
  );
};

export default TargetSwitcher;
