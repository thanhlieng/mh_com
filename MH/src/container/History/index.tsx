/* eslint-disable no-prototype-builtins */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Select, Table } from 'antd';
import { debounce } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { useQuery } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { renderColumnHistory } from '@/contants/columns/history-colums';
import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import useGetPermission from '@/hook/getPermission';
import { getHistory, getHistoryOps } from '@/services/history.services';
import { SearchOutlined } from '@ant-design/icons';

const GET_HISTORY = 'GET_HISTORY';
const PAGE_OPTIONS = [
  {
    key: 'customer',
    value: 'Customer Page',
  },
  {
    key: 'pickup',
    value: 'PickUp Page',
  },
  {
    key: 'operate',
    value: 'Operate Page',
  },
  {
    key: 'manifest_yamato',
    value: 'Manifest Yamato Page',
  },
];

const HistoryContainer = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const { data }: any = useQuery([GET_HISTORY, queries], () =>
    getHistory(queries)
  );

  // const { data: opsData }: any = useQuery([GET_HISTORY_OPS, queriesOps], () => );
  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };

  const handleOnSelect = (value: any) => {
    setQueries((prev) => ({ ...prev, type: value }));
  };

  const handleSelectChange = (value: any) => {
    if (value === undefined) {
      setQueries((prev) => ({ ...prev, type: undefined }));
    } else {
      handleOnSelect(value);
    }
  };

  const handleOnSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  return (
    <div className='flex flex-col'>
      <div className='mb-4 flex items-center'>
        <Select
          defaultValue={null}
          onSelect={(e) => handleOnSelect(e)}
          onChange={(value) => handleSelectChange(value)}
          className='mr-4 w-[200px]'
          allowClear
        >
          {PAGE_OPTIONS?.map((v) => (
            <Select.Option key={v.key} value={v.key}>
              {v.value}
            </Select.Option>
          ))}
        </Select>
        <Input
          placeholder='Tìm kiếm ....'
          prefix={<SearchOutlined />}
          className='w-[350px]'
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleOnSearch(event.target.value)
          }
        />
      </div>

      <Table
        rowKey={'key'}
        className='mt-4 cursor-pointer'
        columns={renderColumnHistory()}
        dataSource={data?.data}
        onChange={handlePagination}
        pagination={{
          current: data?.pagination?.currentPage,
          total: data?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
        bordered
        scroll={{ y: 800, x: 1980 }}
      />
    </div>
  );
};
export default HistoryContainer;
