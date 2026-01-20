/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchOutlined } from '@ant-design/icons';
import { Input, notification, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { debounce } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import {
  deleteCategoryDetails,
  getCategoryDetails,
  getListCategory,
} from '@/services/post.service';

import { renderColumns } from './columns';
import ModalFormCategoryPost from './ModalFormCategoryPost';

const TableCategoryPost = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [idDetails, setIdDetails] = useState<string>();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [form] = useForm();

  const { data: categoriesData, isLoading } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY, queries],
    () => getListCategory(queries)
  );
  const { data: categoriesDataDetails } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY, idDetails],
    () => getCategoryDetails(idDetails)
  );
  const { mutate: deletPolicyDetails } = useMutation(deleteCategoryDetails, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_POST.GET_LIST_CATEGORY]);
      notification.success({
        message: 'Xóa bài viết thành công',
        placement: 'top',
      });
      setIdDetails(undefined);
      form.resetFields();
    },
    onError: (e: any) => {
      notification.error({
        message: `${e.response.data ? e.response.data.message : 'Xóa bài viết thất bại'
          }`,
        placement: 'top',
      });
    },
  });

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };
  const handleDelete = (id: string) => {
    if (id) {
      deletPolicyDetails(id);
    }
  };

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const handleUpdate = (record: any) => {
    setIdDetails(record.id);
    setIsOpenModal(true);
  };

  return (
    <div className='grid gap-4'>
      <Input
        placeholder='Tìm kiếm ....'
        prefix={<SearchOutlined />}
        className='mb-4 mr-4 w-[350px]'
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleSearch(event.target.value)
        }
      />
      <Table
        columns={renderColumns({ handleDelete, handleUpdate })}
        rowKey='key'
        className='cursor-pointer rounded-[10px]'
        dataSource={categoriesData?.data}
        onChange={handlePagination}
        pagination={{
          current: categoriesData?.pagination?.currentPage,
          total: categoriesData?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
        bordered
        scroll={{ y: 350, x: 600 }}
      />

      {idDetails && (
        <ModalFormCategoryPost
          onClose={() => setIsOpenModal(false)}
          isOpen={isOpenModal}
          form={form}
          data={categoriesDataDetails}
          idDetails={idDetails}
        />
      )}
    </div>
  );
};

export default TableCategoryPost;
