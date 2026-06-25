import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ACCOUNT_TYPE, ACTIVE_A_TARGET } from '@/contants/Storage';
import type {
  AccountTargetsResponse,
  AccountType,
  ATarget,
  ATargetLink,
} from '@/services/account-target.services';

export interface ActiveTargetState {
  /** Target đang chọn. `null` khi chưa load (chưa hydrate sau login). */
  current: ATarget | null;
  /** Danh sách target mà account đã liên kết. */
  availableTargets: ATargetLink[];
  /** Loại account: supplier hoặc customer. `null` khi chưa load. */
  accountType: AccountType | null;
}

const isBrowser = typeof window !== 'undefined';

const readInitialTarget = (): ATarget | null => {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(ACTIVE_A_TARGET);
  return raw === 'mhvn' || raw === 'gp' ? raw : null;
};

const readInitialAccountType = (): AccountType | null => {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(ACCOUNT_TYPE);
  return raw === 'supplier' || raw === 'customer' ? raw : null;
};

const initialState: ActiveTargetState = {
  current: readInitialTarget(),
  availableTargets: [],
  accountType: readInitialAccountType(),
};

const persistTarget = (target: ATarget | null) => {
  if (!isBrowser) return;
  if (target) {
    window.localStorage.setItem(ACTIVE_A_TARGET, target);
  } else {
    window.localStorage.removeItem(ACTIVE_A_TARGET);
  }
};

const persistAccountType = (type: AccountType | null) => {
  if (!isBrowser) return;
  if (type) {
    window.localStorage.setItem(ACCOUNT_TYPE, type);
  } else {
    window.localStorage.removeItem(ACCOUNT_TYPE);
  }
};

const activeTargetSlice = createSlice({
  name: 'activeTarget',
  initialState,
  reducers: {
    /** Switch target hiện tại (user đổi qua TargetSwitcher). */
    setActiveTarget(state, action: PayloadAction<ATarget>) {
      state.current = action.payload;
      persistTarget(action.payload);
    },
    /**
     * Hydrate slice từ response `/api/account/a-targets` ngay sau login.
     * Nếu `current` chưa được set hoặc không còn nằm trong availableTargets
     * thì set về target đầu tiên trong danh sách.
     */
    hydrateFromAccountTargets(
      state,
      action: PayloadAction<AccountTargetsResponse>,
    ) {
      const { account_type, targets } = action.payload;
      state.accountType = account_type;
      state.availableTargets = targets;
      persistAccountType(account_type);

      const stillValid =
        state.current !== null &&
        targets.some((t) => t.a_target === state.current);
      if (!stillValid) {
        const next = targets.length > 0 ? targets[0].a_target : null;
        state.current = next;
        persistTarget(next);
      }
    },
    /** Xoá toàn bộ state + localStorage khi logout. */
    clearActiveTarget(state) {
      state.current = null;
      state.availableTargets = [];
      state.accountType = null;
      persistTarget(null);
      persistAccountType(null);
    },
  },
});

export const { setActiveTarget, hydrateFromAccountTargets, clearActiveTarget } =
  activeTargetSlice.actions;

export default activeTargetSlice.reducer;
