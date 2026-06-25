import { notification } from 'antd';
import axios from 'axios';
import querystring from 'query-string';

import { BASE_URL_GEN_BILL } from '@/contants/common.constants';
import {
  ACCOUNT_A_TARGETS,
  AUTH_REFRESH_TOKEN,
} from '@/contants/endpoint';
import { ACCSESS_TOKEN, REFRESH_TOKEN, USER } from '@/contants/Storage';
import { ILogin } from '@/services/Authen.type';
import { store } from '@/store/store';
import storage from '@/utils/storage';

const { getItem, location, setItem, removeAll } = storage();

const axiosClient2 = axios.create({
  baseURL: BASE_URL_GEN_BILL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (param) => querystring.stringify(param),
});

// Whitelist các URL KHÔNG cần header X-A-Target.
// Note: baseURL đã có suffix `/api` (xem common.constants) nên URL trong config
// thường là path tương đối kiểu '/auth/login', '/account/a-targets'...
const TARGET_HEADER_WHITELIST = [
  '/auth/',
  AUTH_REFRESH_TOKEN, // 'auth/refresh-tokens'
  ACCOUNT_A_TARGETS, // '/account/a-targets'
  '/api/directory/suppliers',
];

const requiresTargetHeader = (url?: string): boolean => {
  if (!url) return false;
  return !TARGET_HEADER_WHITELIST.some((prefix) => url.includes(prefix));
};

axiosClient2.interceptors.request.use(
  function (config) {
    const accessToken = getItem(ACCSESS_TOKEN);
    config.headers = { Authorization: `Bearer ${accessToken}` };

    // Multi-target: đính header `X-A-Target` cho mọi request /api/* trừ
    // auth/* và /account/a-targets.
    if (requiresTargetHeader(config.url)) {
      const activeTarget = store.getState().activeTarget.current;
      if (activeTarget) {
        config.headers['X-A-Target'] = activeTarget;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosClient2.interceptors.response.use(
  function (response) {
    return response.data;
  },
  async function (error) {
    const originalConfig = error.config;

    // 409 từ guard: account chưa liên kết với target đang chọn.
    if (error.response?.status === 409) {
      const msg =
        error.response.data?.message ||
        'Tài khoản chưa liên kết với hệ A được chọn. Vui lòng liên hệ quản trị viên.';
      notification.error({
        message: 'Không truy cập được hệ A',
        description: msg,
        placement: 'top',
      });
    }

    // 400 từ guard: thiếu/sai header X-A-Target.
    if (
      error.response?.status === 400 &&
      typeof error.response.data?.message === 'string' &&
      error.response.data.message.includes("X-A-Target")
    ) {
      notification.error({
        message: 'Thiếu thông tin hệ A',
        description: error.response.data.message,
        placement: 'top',
      });
    }

    if (originalConfig?.url !== '/login' && error.response) {
      if (error.response.status === 401) {
        if (originalConfig.retry) {
          removeAll();
          return location('/login');
        }
        const refreshToken = getItem(REFRESH_TOKEN);
        if (!refreshToken) {
          removeAll();
          return location('/login');
        }
        try {
          originalConfig.retry = true;
          const res: ILogin = await axiosClient2.post(AUTH_REFRESH_TOKEN, {
            refreshToken: getItem(REFRESH_TOKEN),
          });
          setItem(ACCSESS_TOKEN, res.tokens.access.token);
          setItem(REFRESH_TOKEN, res.tokens.refresh.token);
          setItem(USER, JSON.stringify(res.user));
          return axiosClient2(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }
    if (originalConfig?.url !== '/administrator/login' && error.response) {
      if (error.response.status === 401) {
        if (originalConfig.retry) {
          removeAll();
          return location('/administrator/login');
        }
        const refreshToken = getItem(REFRESH_TOKEN);
        if (!refreshToken) {
          removeAll();
          return location('/administrator/login');
        }
        try {
          originalConfig.retry = true;
          const res: ILogin = await axiosClient2.post(AUTH_REFRESH_TOKEN, {
            refreshToken: getItem(REFRESH_TOKEN),
          });
          setItem(ACCSESS_TOKEN, res.tokens.access.token);
          setItem(REFRESH_TOKEN, res.tokens.refresh.token);
          setItem(USER, JSON.stringify(res.user));
          return axiosClient2(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }

    if (error.message === 'Network Error' && error.response) {
      alert('Please check your internet connection and try again');
    }
    return Promise.reject(error);
  }
);

export default axiosClient2;
