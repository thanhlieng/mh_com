import axios from 'axios';
import querystring from 'query-string';

import { BASE_URL_GEN_BILL } from '@/contants/common.constants';
import { AUTH_REFRESH_TOKEN } from '@/contants/endpoint';
import {
  ACCSESS_TOKEN,
  ACTIVE_CUSTOMER_ID,
  ACTIVE_SUPPLIER_ID,
  REFRESH_TOKEN,
  USER,
} from '@/contants/Storage';
import { ILogin } from '@/services/Authen.type';
import storage from '@/utils/storage';

const { getItem, location, setItem, removeAll } = storage();

const axiosClient2 = axios.create({
  baseURL: BASE_URL_GEN_BILL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (param) => querystring.stringify(param),
});
axiosClient2.interceptors.request.use(
  function (config) {
    const accessToken = getItem(ACCSESS_TOKEN);
    config.headers = { Authorization: `Bearer ${accessToken}` };
    // Multi-link: đính id thực thể A đang chọn để BE proxy mint đúng token.
    const activeSupplierId = getItem(ACTIVE_SUPPLIER_ID);
    const activeCustomerId = getItem(ACTIVE_CUSTOMER_ID);
    if (activeSupplierId) {
      config.headers['X-Active-Supplier-Id'] = activeSupplierId;
    }
    if (activeCustomerId) {
      config.headers['X-Active-Customer-Id'] = activeCustomerId;
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
    if (originalConfig.url !== '/login' && error.response) {
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
    if (originalConfig.url !== '/administrator/login' && error.response) {
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
