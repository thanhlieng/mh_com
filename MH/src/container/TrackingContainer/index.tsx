/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collapse, Progress, Spin, Timeline } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import InputCustome from '@/components/input/InputCustome';

import { trackingBooking } from '@/services/booking.services';
import {
  getDayInDateString,
  getHourInDateString,
} from '@/utils/common-function';
import { getStatusTracking } from '@/utils/ultils';

const { Panel } = Collapse;

const TrackingContainer = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [query, setQueries] = useState({
    search: '',
    page: 1,
    pageSize: 10,
    billCodes: [] as string[],
  });
  const { id } = router.query;
  const [search, setSearch] = useState('');

  const { data: dataDelivery, isLoading } = useQuery(
    ['trackingBooking', { query }],
    () => trackingBooking(query)
  );

  const handleSearch = () => {
    setQueries((prev) => ({ ...prev, billCodes: search.split(' ') }));
  };

  useEffect(() => {
    if (id) {
      const billCodes = id.toString().split(' ') as string[];
      setQueries((prev) => ({
        ...prev,
        billCodes: billCodes,
      }));
    }
  }, [id]);

  const renderHeader = (v: any) => {
    return (
      <div className='flex w-full flex-row items-center gap-4 px-4 '>
        <div>{getStatusTracking(v.tag)}</div>
        <div className=' flex w-full  flex-row gap-x-4 '>
          <div className='flex w-full flex-row items-center justify-between'>
            <div>
              <div className='flex flex-row items-center gap-4 '>
                <p className='m-0 p-0'>{`${
                  v?.booking?.bookingCode || v.orderNumber
                }`}</p>
              </div>
              <div>
                <p className='m-0 p-0 text-[#464DF4]'>{v.subtagMessage}</p>
              </div>
            </div>

            <div className='xs:hidden'>{`${getDayInDateString(
              v.shipmentDeliveryDate
            )} ${getHourInDateString(v.shipmentDeliveryDate)} - ${
              v.subtagMessage
            }`}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='m-auto  mb-[86px]  max-w-[700px] xs:px-[15px]'>
      <div className='mt-[50px] flex items-center justify-center gap-[10px]'>
        <Image src='/images/box.svg' width={40} height={40} alt='' />
        <p className='m-0 p-0 text-[18px] font-medium uppercase leading-[22px]'>
          {t('TRACK YOUR SHIPMENT')}
        </p>
      </div>

      <InputCustome
        handleButtonClick={handleSearch}
        placeholder='Nhập mã đơn hàng'
        styleButton='mb-5'
        onChange={(e) => setSearch(e.target.value)}
        suffix={
          <Image
            onClick={handleSearch}
            src='/images/search-icon.svg'
            className='cursor-pointer'
            width={38}
            height={38}
            alt='search'
          />
        }
      />

      <Spin spinning={isLoading}>
        {dataDelivery?.data && dataDelivery.data.length > 0 ? (
          <Collapse
            defaultActiveKey={[dataDelivery.data[0]]}
            expandIconPosition='right'
            className='rounded-[10px]'
          >
            {dataDelivery.data.map((v, i) => (
              <Panel header={renderHeader(v)} key={i}>
                <div className='mb-5 flex flex-col gap-4'>
                  <p className='m-0 p-0'>{v.subtagMessage}</p>
                  <Progress
                    percent={
                      (v.checkpoints?.length / v.trackedCount) * 100 || 0
                    }
                    showInfo={false}
                  />
                  <Timeline className='px-5 pt-4'>
                    {v.checkpoints.map((checkpoints: any) => (
                      <Timeline.Item
                        color='green'
                        key={v.id}
                        dot={getStatusTracking(checkpoints.tag)}
                      >
                        <div>
                          <p className='m-0 p-0 font-bold'>
                            {checkpoints.message}
                          </p>

                          <p className='text-4 '>
                            {`${getDayInDateString(
                              checkpoints.checkpointTime
                            )} ${getHourInDateString(
                              checkpoints.checkpointTime
                            )}`}
                            {' · '}
                            <span>{checkpoints.location}</span>
                          </p>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div className='text-center text-xl font-bold'>
            Không tìm thấy đơn hàng này trong hệ thống
          </div>
        )}
      </Spin>
    </div>
  );
};

export default TrackingContainer;
