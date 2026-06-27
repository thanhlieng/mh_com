import { useQuery } from 'react-query';

import { teamplateInvoiceList } from '@/services/booking.services';

const useInvoiceTeamplate = () => {
  const { isLoading, data } = useQuery(['templateInvoice'], () =>
    teamplateInvoiceList()
  );
  return {
    isLoading,
    data,
  };
};
export default useInvoiceTeamplate;
