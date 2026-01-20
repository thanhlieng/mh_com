/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormInstance, Tabs } from 'antd';
import React from 'react';

import { DetailsBookingPost, IInvoiceDetails } from '@/contants/types';

import AddressDetails from './AddressDetails';
import General from './General';
import InvoiceTeamplate from './InvoiceTeamplate';
import ProcessingInfomation from './ProcessingInfomation';
import NewInvoice from '../NewInvoice';

const TabsDetailsBooking = ({
  form,
  detailsBooking,
  value,
  isInvoice,
  detailNewInvoice,
  handleAddInvoice,
  handleDeleteInvoice,
  handleUpdateBookingInvoice,
  handleSetDetailsInvoice,
}: {
  form: FormInstance;
  detailsBooking: Array<DetailsBookingPost>;
  value: any;
  isInvoice: boolean;
  detailNewInvoice: Array<IInvoiceDetails>;
  handleAddInvoice: (resForm: any) => void;
  handleDeleteInvoice: (id: any) => void;
  handleUpdateBookingInvoice: (form: IInvoiceDetails) => void;
  handleSetDetailsInvoice: (data: IInvoiceDetails[]) => void;
}) => {
  return (
    <div>
      <Tabs type='card'>
        <Tabs.TabPane tab='Thông tin chung' key='general-information'>
          <General form={form} dataDetails={detailsBooking} value={value} />
        </Tabs.TabPane>
        <Tabs.TabPane tab='Địa chỉ' key='address'>
          <AddressDetails form={form} />
        </Tabs.TabPane>
        <Tabs.TabPane tab='Thông tin xử lý' key='Processing'>
          <ProcessingInfomation form={form} />
        </Tabs.TabPane>

        <Tabs.TabPane tab='Bổ sung Invoice' key='Invoice' disabled={isInvoice}>
          <NewInvoice
            form={form}
            detailsInvoice={detailNewInvoice}
            handleAddInvoiceDetails={handleAddInvoice}
            handleDeleteInvoice={handleDeleteInvoice}
            handleUpdateBookingInvoice={handleUpdateBookingInvoice}
            handleSetDetailsInvoice={handleSetDetailsInvoice}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab='Mẫu Invoice' key='Invoice-teamplate'>
          <InvoiceTeamplate />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default TabsDetailsBooking;
