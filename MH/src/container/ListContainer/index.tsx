/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker, Input, notification, Select, Spin, Table } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useQuery } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { LIST_COLUMNS_CARGO_LIST } from '@/contants/columns/list.columns';
import { QUERY_PARAMS } from '@/contants/common.constants';
import {
  getList,
  IParamsList,
  QueriesParamsList,
} from '@/services/list.services';
const { Option } = Select;
export const GET_LIST = 'GET_LIST';

const { RangePicker } = DatePicker;

import ExpandItem from './components/ExpandItems';

const ListContainer = () => {
  const [queries, setQueries] = useState<IParamsList & QueriesParamsList>({
    page: 1,
    pageSize: 10,
    search: '',
    from: moment().startOf('month').format(),
    to: moment().endOf('month').format(),
  });

  const [selectedChildrenRowKeys, setSelectedChilrenRowKeys] = useState<
    React.Key[]
  >([]);
  const [currency, setCurrency] = useState<'VND' | 'USD'>('USD');
  const onSelectChildChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedChilrenRowKeys(newSelectedRowKeys);
  };

  const { data, isLoading } = useQuery([GET_LIST, queries], () =>
    getList({ params: queries })
  );

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };

  const handleChangeDateFilter = (value: any) => {
    setQueries((prev) => ({
      ...prev,
      from: moment(value?.[0]).format(),
      to: moment(value?.[1]).format(),
    }));
  };

  return (
    <div>
      <div className='flex flex-row flex-wrap gap-4'>
        <Input
          placeholder='Search'
          className='w-[250px]'
          onChange={(e) =>
            setQueries((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <DatePicker
          picker='month'
          format='MM/YYYY'
          placeholder='Chọn tháng năm xuất bảng kê'
          className='w-[250px]'
          onChange={(e) =>
            setQueries((prev) => ({
              ...prev,
              month: moment(e).format('M'),
              year: moment(e).format('YYYY'),
            }))
          }
          defaultValue={moment()}
        />
        <RangePicker
          format='DD-MM-YYYY'
          onChange={handleChangeDateFilter}
          className='h-8 w-[300px]'
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          defaultValue={[moment().startOf('month'), moment().endOf('month')]}
        />
        <Select
          defaultValue={currency}
          onSelect={(e) => setCurrency(e)}
          className='w-[150px]'
        >
          <Option value='VND'>VND</Option>
          <Option value='USD'>USD</Option>
        </Select>
      </div>
      <div className='my-4'>
        <Table
          loading={isLoading}
          columns={LIST_COLUMNS_CARGO_LIST[currency]}
          rowKey={(record) => record.customer_id}
          className='cursor-pointer rounded-[10px]'
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
          expandable={{
            expandedRowRender: (record) => {
              return (
                <ExpandItem
                  id={record.customer_id}
                  month={queries.month}
                  year={queries.year}
                  from={queries.from}
                  to={queries.to}
                  onSelectChange={onSelectChildChange}
                  selectedRowKeys={selectedChildrenRowKeys}
                  currency={currency}
                />
              );
            },
          }}
          scroll={{ y: 850, x: 600 }}
        />
      </div>
    </div>
  );
};

export default ListContainer;
