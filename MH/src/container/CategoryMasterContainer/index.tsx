/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, notification, Select, Table } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import VSelect from '@/components/common/VSelect';

import { categoriesMaster } from '@/contants/columns/customer-columns';
import { MasterListOptions } from '@/contants/types';
import {
  connectPartnerServices,
  createDateCustomerManageCompnanies,
  createExchangeRate,
  createFixedPrice,
  createJapanAddress,
  createRequestServices,
  deleteCustomerMangerCompanies,
  deleteExchangeRate,
  deleteFixedPrice,
  deleteJapanAddress,
  deleteRequestServices,
  fetchServicePartnerServiceByZone,
  getDataCustomerMangerCompanies,
  getExchangeRate,
  getFixedPrice,
  getRequestServices,
  postServices,
  postServicesPartner,
  postUnits,
  updateCustomerManagerCompanies,
  updateExchangeRate,
  updateFixedPrice,
  updateRequestServices,
} from '@/services/booking.services';
import { fetchServicePartnerService } from '@/services/booking.services';
import {
  deleteServices,
  deleteUnit,
  getJapanAddress,
  getServices,
  getUnit,
  updateJapanAddress,
  updateServices,
  updateUnit,
} from '@/services/customer.services';
import moment from 'moment';
const queryKey = 'fetchData';

import ItemControlTableRender from '@/components/TableCustom';

import ModalCategoryMaster from './components/ModalCategoryMaster';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { QueryParams2 } from '@/contants/common.constants';

const QUERY_PARAMS: QueryParams2 = {
  search: '',
  page: 1,
  pageSize: 20,
};

const CategoryMasterContainer = () => {
  const [queries, setQueries] = useState<QueryParams2>(QUERY_PARAMS);
  const [selected, setSelected] = useState<
    MasterListOptions | undefined | string
  >();
  const [form] = Form.useForm();
  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  const [idKey, setIdKey] = useState();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const masterListOptions = Object.entries(MasterListOptions).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  const canSearchItemCategories = (selected: any): boolean => {
    switch (selected) {
      case 'JAPAN_ADDRESS':
        return true;
      default:
        return false;
    }
  };

  const getDataCollections = (selected: any) => {
    switch (selected) {
      case 'SERVICE_PARTNER_INCOUNTRY':
        return fetchServicePartnerServiceByZone('DOMESTIC');
      case 'SERVICE_PARTNER':
        return fetchServicePartnerService();
      case 'SERVICE_BOOKING':
        return getServices();
      case 'JAPAN_ADDRESS':
        return getJapanAddress(queries);
      case 'CONNECTION_PARTNER':
        return connectPartnerServices();
      case 'CUSTOMER_MANGER_COMPANY':
        return getDataCustomerMangerCompanies();
      case 'REQUEST_SERVICES':
        return getRequestServices();
      case 'FIXED_PRICE':
        return getFixedPrice();
      case 'EXCHANGE_RATE':
        return getExchangeRate();
      default:
        return getUnit() as any;
    }
  };

  const { data, isLoading, isFetching } = useQuery(
    [queryKey, selected, queries],
    () => getDataCollections(selected)
  );

  const createCollections = (selected: any) => {
    switch (selected) {
      case 'SERVICE_PARTNER_INCOUNTRY':
        return postServicesPartner;
      case 'SERVICE_PARTNER':
      case 'CONNECTION_PARTNER':
      case 'SERVICE_BOOKING':
        return postServices;
      case 'CUSTOMER_MANGER_COMPANY':
        return createDateCustomerManageCompnanies;
      case 'REQUEST_SERVICES':
        return createRequestServices;
      case 'FIXED_PRICE':
        return createFixedPrice;
      case 'JAPAN_ADDRESS':
        return createJapanAddress;
      case 'EXCHANGE_RATE':
        return createExchangeRate;
      default:
        return postUnits;
    }
  };

  const deleteCollections = (selected: any) => {
    switch (selected) {
      case 'UNIT_INFOMATION':
        return deleteUnit;
      case 'CUSTOMER_MANGER_COMPANY':
        return deleteCustomerMangerCompanies;
      case 'JAPAN_ADDRESS':
        return deleteJapanAddress;
      case 'REQUEST_SERVICES':
        return deleteRequestServices;
      case 'FIXED_PRICE':
        return deleteFixedPrice;
      case 'EXCHANGE_RATE':
        return deleteExchangeRate;
      default:
        return deleteServices;
    }
  };

  const updateCollections = (selected: any) => {
    switch (selected) {
      case 'JAPAN_ADDRESS':
        return updateJapanAddress;
      case 'UNIT_INFOMATION':
        return updateUnit;
      case 'CUSTOMER_MANGER_COMPANY':
        return updateCustomerManagerCompanies;
      case 'REQUEST_SERVICES':
        return updateRequestServices;
      case 'FIXED_PRICE':
        return updateFixedPrice;
      case 'EXCHANGE_RATE':
        return updateExchangeRate;
      default:
        return updateServices;
    }
  };

  const { mutate: deleteMutation } = useMutation(deleteCollections(selected), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      notification.success({
        message: 'Thành công',
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Xóa thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: createItemsCollections } = useMutation(
    createCollections(selected),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKey]);
        notification.success({
          message: 'Tạo mới thành công',
          placement: 'top',
        });
        handleClose();
      },
      onError: (e: any) => {
        notification.error({
          message: `${
            e.response.data ? e.response.data.message : 'Tạo mới thất bại'
          }`,
          placement: 'top',
        });
      },
    }
  );

  const { mutate: updateMutation } = useMutation(updateCollections(selected), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
      handleClose();
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Xóa thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const handleUpdateRow = (record: any) => {
    setIsUpdate(true);
    setIdKey(record.id);
    form.setFieldsValue({ ...record });
    if (selected === 'EXCHANGE_RATE') {
      form.setFieldsValue({
        ...record,
        timeApplyFrom: moment(record.timeApplyFrom),
        timeApplyTo: moment(record.timeApplyTo),
      });
    }
  };

  const handleDelteRow = (record: any) => {
    if (record.id) {
      deleteMutation(record.id);
    }
  };

  const handleSubmit = async () => {
    const value = await form.validateFields();
    if (idKey) {
      if (isUpdate) {
        updateMutation({ id: idKey, data: value });
      }
    } else {
      switch (selected) {
        case 'SERVICE_PARTNER':
          return createItemsCollections({
            ...value,
            typeService: 'SERVICE_PARTNER',
          });
        case 'CONNECTION_PARTNER':
          return createItemsCollections({
            ...value,
            typeService: 'CONNECTION_PARTNER',
          });
        case 'SERVICE_BOOKING':
          return createItemsCollections({
            ...value,
            typeService: 'SERVICE_BOOKING',
          });

        case 'CUSTOMER_MANGER_COMPANY':
          return createItemsCollections(value);

        default:
          return createItemsCollections(value);
      }
    }
  };

  const handleClose = () => {
    setIsUpdate(false);
    setOpenModal(false);
    form.resetFields();
    setIdKey(undefined);
  };

  const handleSelect = (e: any) => {
    setSelected(e);
  };

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  return (
    <div>
      <div className='flex items-end gap-4 xs:hidden'>
        <VSelect
          label='Chọn Danh mục'
          className='w-[300px]'
          placeholder='Chọn danh mục'
          onChange={handleSelect}
        >
          {masterListOptions.map((v) => (
            <Select.Option value={v.value} key={v.value}>
              {v.label}
            </Select.Option>
          ))}
        </VSelect>

        <Button
          type='primary'
          onClick={() => setOpenModal(true)}
          disabled={!selected}
        >
          Tạo mới
        </Button>
      </div>
      <div className='hidden xs:flex xs:flex-col xs:gap-4'>
        <VSelect
          label='Chọn Danh mục'
          className='w-[300px]'
          placeholder='Chọn danh mục'
          onChange={handleSelect}
          isHorizal
        >
          {masterListOptions.map((v) => (
            <Select.Option value={v.value} key={v.value}>
              {v.label}
            </Select.Option>
          ))}
        </VSelect>

        <Button
          type='primary'
          onClick={() => setOpenModal(true)}
          disabled={!selected}
        >
          Tạo mới
        </Button>
      </div>

      {canSearchItemCategories(selected) && (
        <div className='mt-4 w-[400px]'>
          <Input
            placeholder='Tìm kiếm'
            prefix={<SearchOutlined />}
            className='text-input h-8 '
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSearch(event.target.value)
            }
          />
        </div>
      )}

      <div className='mt-2'>
        <Table
          loading={isFetching || isLoading}
          columns={categoriesMaster({
            type: selected,
            handleUpdateRow,
            handleDelteRow,
          })}
          key={Math.random()}
          dataSource={data || []}
          bordered
          pagination={{
            // current: data?.pagination?.currentPage,
            // total: data?.pagination?.totalCount,
            showSizeChanger: false,
            defaultPageSize: 20,
            itemRender: ItemControlTableRender,
          }}
          scroll={{ y: 450, x: 800 }}
        />
      </div>
      {(openModal || isUpdate) && (
        <ModalCategoryMaster
          isOpen={openModal || isUpdate}
          form={form}
          type={selected}
          isUpdate={isUpdate}
          onClose={handleClose}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default CategoryMasterContainer;
