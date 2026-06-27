import { Spin } from 'antd';
import { useState } from 'react';
import { useQuery } from 'react-query';

import ToogleButton from '@/components/ToggleButton';

import { myBookingHome } from '@/services/booking.services';

import TableView from './components/TableView';

const HomeManager = () => {
  const { data, isLoading, isFetching } = useQuery(
    ['ModalViewBooking', {}],
    () => myBookingHome()
  );

  const [checked, setChecked] = useState(true);

  return (
    <Spin spinning={isFetching || isLoading}>
      <div className='mt-[40px] mb-[20px] w-full px-2 text-center'>
        <ToogleButton
          checked={checked}
          handleClick={() => setChecked(!checked)}
          unCheckTitle='Đơn hàng chưa xác nhận'
          checkedTitle='Đơn hàng đã xác nhận'
        />
      </div>

      {checked ? (
        <div className='mx-auto w-full p-4 sm:w-full'>
          <TableView data={data?.bookingHandedOver || []} />
        </div>
      ) : (
        <div className='mx-auto  p-4 sm:w-full'>
          <TableView data={data?.bookingNotYetHandedOver || []} />
        </div>
      )}
    </Spin>
  );
};

export default HomeManager;
