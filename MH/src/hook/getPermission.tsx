import { useEffect, useState } from 'react';

import { USER } from '@/contants/Storage';

const useGetPermission = () => {
  const [permissions, setPermission] = useState<Array<string> | undefined>();
  const user = localStorage.getItem(USER);
  useEffect(() => {
    if (user) {
      const { permissions } = JSON.parse(user);
      setPermission(permissions);
    }
  }, [user]);

  return {
    permissions,
  };
};

export default useGetPermission;
