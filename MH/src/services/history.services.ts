/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryParams } from '@/contants/common.constants';
import HttpRequest from '@/utils/Http-request';

export interface ModuleName {
  module_name: string;
  actions: Array<ActionModule>;
}
interface ActionModule {
  action: string | undefined;
  description: string;
  selected: boolean;
}
export const getHistory = (params: QueryParams) => {
  return HttpRequest.get('history', {
    params: {
      ...params,
    },
  });
};
export const getHistoryOps = (params: any) => {
  return HttpRequest.get('history/ops', {
    params: {
      ...params,
    },
  });
};

