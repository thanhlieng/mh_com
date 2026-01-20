import { useQuery } from 'react-query';

import HttpRequest from '@/utils/Http-request';

const getDataPostCode = () => {
  return HttpRequest.get(`booking/postcode`);
};
export const GET_DATA_POST_CODE = 'GET_DATA_POST_CODE';

const usePostCode = () => {
  const { data: dataPostCode, isLoading: postCodeLoading } = useQuery(
    [GET_DATA_POST_CODE],
    () => getDataPostCode()
  );
  return { dataPostCode, postCodeLoading };
};

export default usePostCode;
