/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { FormInstance, Tabs } from 'antd';
import useTranslation from 'next-translate/useTranslation';

import {
  AddressCustomer,
  DetailsBookingPost,
  EAddressBookingType,
} from '@/contants/types';

import Address from './components/address';
import GeneralInfomation from './components/generalInfo';
import SenderAddress from './components/SenderAddress';

interface TabsBookingProps {
  form: FormInstance;
  detailsBooking: Array<DetailsBookingPost>;
  handleAddBookingDetails: (form: any) => void;
  userData: any;
  addressCustome?: Partial<AddressCustomer>;
  handleDeleteRow: (id: any) => void;
  handleUpdateBookingDetails: (form: any) => void;
  handleChangeInfoSender: (name: string, value: any) => void;
  handleChangeInfoRecei: (name: string, value: any) => void;
  serivcesSelected: any;
  handleServicesSelected: (e: any) => void;
  value: any;
  handleSetValue: (e: any) => void;
  handleAutoSender: (value: any) => void;
  handleAutoReceive: (value: any) => void;
  disableAddress?: boolean;
  setIsEcommerceService: (value: any) => void;
  handleUpdateReferenceCode: (value: any) => void;
}

const TabsBooking = ({
  form,
  handleAddBookingDetails,
  handleDeleteRow,
  handleAutoReceive,
  handleUpdateBookingDetails,
  detailsBooking,
  userData,
  disableAddress,
  addressCustome,
  handleChangeInfoSender,
  handleChangeInfoRecei,
  serivcesSelected,
  value,
  handleSetValue,
  handleServicesSelected,
  handleAutoSender,
  setIsEcommerceService,
  handleUpdateReferenceCode,
}: TabsBookingProps) => {
  const { t } = useTranslation('booking');
  return (
    <div className='px-[153px] xs:px-[15px] sm:px-[38px]'>
      <Tabs>
        <Tabs.TabPane tab={t('General Information')} key='general-information'>
          <GeneralInfomation
            form={form}
            dataDetails={detailsBooking}
            serivcesSelected={serivcesSelected}
            handleServicesSelected={handleServicesSelected}
            handleUpdateBookingDetails={handleUpdateBookingDetails}
            handleAddBookingDetails={handleAddBookingDetails}
            handleDeleteRow={handleDeleteRow}
            value={value}
            handleSetvalue={handleSetValue}
            setIsEcommerceService={setIsEcommerceService}
            handleUpdateReferenceCode={handleUpdateReferenceCode}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('Address')} key='address'>
          <Address
            form={form}
            dataUser={userData}
            handleChangeInfoSender={handleChangeInfoSender}
            handleChangeInfoRecei={handleChangeInfoRecei}
            addressCustome={addressCustome}
            handleAutoSender={handleAutoSender}
            handleAutoReceive={handleAutoReceive}
          />
        </Tabs.TabPane>

        {!disableAddress && (
          <Tabs.TabPane
            tab={t('Address Book - Sender Address')}
            key={EAddressBookingType.SENDER_ADDRESS}
          >
            <SenderAddress type={EAddressBookingType.SENDER_ADDRESS} />
          </Tabs.TabPane>
        )}
        {!disableAddress && (
          <Tabs.TabPane
            tab={t('Address Book - Recipient Address')}
            key={EAddressBookingType.RECEIVER_ADDRESS}
          >
            <SenderAddress type={EAddressBookingType.RECEIVER_ADDRESS} />
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default TabsBooking;
