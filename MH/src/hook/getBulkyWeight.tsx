import { useQuery } from 'react-query';

import { QUERY_BOOKING_ADDRESS } from '@/contants/query-key/booking.query';
import { calculateBulkyWeight } from '@/services/booking.services';

interface useGetBullkyWeightProps {
  serviceId: string;
  width: number;
  height: number;
  longs: number;
}
const useGetBullkyWeight = ({
  serviceId,
  width,
  height,
  longs,
}: useGetBullkyWeightProps) => {
  const { data, isLoading, isFetching } = useQuery(
    [
      QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS,
      { serviceId, width, height, longs },
    ],
    () => calculateBulkyWeight({ serviceId, width, height, longs })
  );

  return {
    data,
    isLoading,
    isFetching,
  };
};

export default useGetBullkyWeight;
