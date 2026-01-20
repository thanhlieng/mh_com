import React from 'react';

const CreateBookingContainer = dynamic(
  () => import('@/container/MangerContainer/CreateBookingContainer'),
  { ssr: false }
);

import dynamic from 'next/dynamic';

import HomeLayout from '@/layout/HomeLayout';

const CreateBooking = () => {
  return <CreateBookingContainer />;
};

CreateBooking.Layout = HomeLayout;
export default CreateBooking;
