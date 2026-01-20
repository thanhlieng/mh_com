/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchOutlined } from '@ant-design/icons';
import { Form, Input, notification, Table } from 'antd';
import { debounce } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { ETypeLinkHomepage } from '@/components/FormPolicy/type';
import ItemControlTableRender from '@/components/TableCustom';

import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import {
  deleteListPost,
  getDetailsListPost,
  getListCategory,
  getListPost,
  updateListPost,
} from '@/services/post.service';

import { renderColumns } from './columns';
import ModalPost from './ModalPost';

const TablePost = ({
  typeSelect,
  handleChangeSelect,
}: {
  typeSelect: ETypeLinkHomepage | null | undefined;
  handleChangeSelect: (e: any) => void;
}) => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [idDetails, setIdDetails] = useState<string>();
  const queryClient = useQueryClient();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [form] = Form.useForm();

  // data select để map

  const { data: categoriesData, isLoading } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY_CREATE_POST, queries],
    () => getListCategory(queries)
  );

  const { data: postsData } = useQuery(
    [QUERY_POST.GET_LIST_POST, queries],
    () => getListPost(queries)
  );

  const { data: postsDataDetails } = useQuery(
    [QUERY_POST.GET_LIST_POST, idDetails],
    () => getDetailsListPost(idDetails)
  );

  const { mutate: deletePost } = useMutation(deleteListPost, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_POST.GET_LIST_POST]);
      notification.success({
        message: 'Tạo mới danh mục bài viết thành công',
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Tạo mới thất bại'
        }`,
        placement: 'top',
      });
    },
  });
  const { mutate: updatePost } = useMutation(updateListPost, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_POST.GET_LIST_POST]);
      notification.success({
        message: 'Thành công',
        placement: 'top',
      });
      form.resetFields();
      setIsOpenModal(false);
    },
    onError: (e: any) => {
      notification.error({
        message: `${e.response.data ? e.response.data.message : 'Thất bại'}`,
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
      deletePost(id);
    }
  };

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const handleUpdate = (record: any) => {
    setIdDetails(record.id);
    setIsOpenModal(true);
  };

  const handleSubmit = async () => {
    if (idDetails) {
      const res = await form.validateFields();
      updatePost({
        id: idDetails,
        params: { ...res, categoryId: res.categoryId?.value || res.categoryId },
      });
    }
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
        dataSource={postsData?.data}
        onChange={handlePagination}
        pagination={{
          current: postsData?.pagination?.currentPage,
          total: postsData?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
        bordered
        scroll={{ y: 650, x: 600 }}
      />
      {idDetails && (
        <ModalPost
          onClose={() => setIsOpenModal(false)}
          isOpen={isOpenModal}
          typeSelect={ETypeLinkHomepage.POST}
          handleChangeSelect={handleChangeSelect}
          form={form}
          handleSubmit={handleSubmit}
          data={postsDataDetails}
        />
      )}
    </div>
  );
};

export default TablePost;
