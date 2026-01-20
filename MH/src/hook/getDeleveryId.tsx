import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { fetchDeliveryCondition } from '@/services/booking.services';

const useGetDeleveryId = () => {
  const { data, isLoading, isFetching } = useQuery(
    ['fetchDeliveryCondition', {}],
    () => fetchDeliveryCondition()
  );

  const opitionDeliveryConditions = useMemo(() => {
    if (data && data?.length > 0) {
      return data?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    return [];
  }, [data]);
  return {
    data,
    isLoading,
    isFetching,
    opitionDeliveryConditions,
  };
};

export default useGetDeleveryId;
