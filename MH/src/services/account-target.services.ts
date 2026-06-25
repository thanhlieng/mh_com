import { ACCOUNT_A_TARGETS } from '@/contants/endpoint';
import axiosClient2 from '@/utils/axiosClient2';

// ─── Multi-target A integration ───────────────────────────────────────────────
// Một account mhcom có thể liên kết với 2 hệ A (mhvn + gp). FE cần switch
// runtime giữa các target và đính kèm header `X-A-Target` mọi request /api/*.

export type ATarget = 'mhvn' | 'gp';
export type AccountType = 'supplier' | 'customer';

export interface ATargetLink {
  a_target: ATarget;
  /** Danh sách id thực thể (supplier hoặc customer) trong hệ A tương ứng. */
  entity_ids: string[];
}

export interface AccountTargetsResponse {
  account_type: AccountType;
  targets: ATargetLink[];
}

/**
 * Lấy danh sách hệ A mà account hiện tại đã liên kết.
 * Yêu cầu JWT nhưng KHÔNG cần header `X-A-Target`.
 */
export const fetchAccountTargets = (): Promise<AccountTargetsResponse> => {
  return axiosClient2.get(ACCOUNT_A_TARGETS) as Promise<AccountTargetsResponse>;
};
