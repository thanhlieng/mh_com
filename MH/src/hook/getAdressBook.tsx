import { useQuery } from 'react-query';

import { QUERY_BOOKING_ADDRESS } from '@/contants/query-key/booking.query';
import { EAddressBookingType } from '@/contants/types';
import { getAddressBook } from '@/services/customer.services';

const useGetAddressBook = ({ type }: { type: EAddressBookingType }) => {
  const { data, isLoading, isFetching } = useQuery(
    [QUERY_BOOKING_ADDRESS.GET_BOOKING_ADDRESS, { type }],
    () => getAddressBook({ type }),
    {
      refetchOnMount: false,
    }
  );

  return {
    data,
    isLoading,
    isFetching,
  };
};

export default useGetAddressBook;
