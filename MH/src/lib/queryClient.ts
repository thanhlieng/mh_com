import { QueryClient } from 'react-query';

// Singleton QueryClient — chia sẻ giữa _app.tsx và các nơi cần invalidate
// (vd: TargetSwitcher khi user switch target phải clear toàn bộ cache).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
