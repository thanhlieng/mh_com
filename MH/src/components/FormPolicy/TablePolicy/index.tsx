/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchOutlined } from '@ant-design/icons';
import { Input, notification, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { debounce } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import {
  deletePolicy,
  detailsPolicy,
  getPolicy,
  updatePolicy,
} from '@/services/post.service';

import { renderColumns } from './columns';
import ModalUpdatePoLicy from './ModalUpdatePolicy';
import { ETypeLinkHomepage } from '../type';

const TablePolicy = () => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const [idDetails, setIdDetails] = useState<string | undefined>();
  const [typeSelect, setTypeSelect] = useState(ETypeLinkHomepage.LINK);

  const [form] = useForm();
  const queryClient = useQueryClient();

  const { data: dataPolicy } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY, queries],
    () => getPolicy(queries)
  );
  const { data: dataDetailsPolicy } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY, idDetails],
    () => detailsPolicy(idDetails)
  );

  const { mutate: deletPolicyDetails } = useMutation(deletePolicy, {
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
        message: `${
          e.response.data ? e.response.data.message : 'Xóa bài viết thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: updateDataPolicy } = useMutation(updatePolicy, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_POST.GET_LIST_CATEGORY]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
      setIdDetails(undefined);
      form.resetFields();
      setIsOpenModal(false);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };
  const handleDelete = (id: string) => {
    deletPolicyDetails(id);
  };

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const handleUpdate = (record: any) => {
    setIdDetails(record.id);
    setIsOpenModal(true);
  };

  const handleUpdatePolicy = async () => {
    if (idDetails) {
      const resForm = await form.validateFields();
      updateDataPolicy({ id: idDetails, params: resForm });
    }
  };

  const handleChangeSelect = (type: ETypeLinkHomepage) => {
    setTypeSelect(type);
  };

  useEffect(() => {
    form.setFieldsValue({ ...dataDetailsPolicy });
    handleChangeSelect(dataDetailsPolicy?.typeLink || ETypeLinkHomepage.LINK);
  }, [dataDetailsPolicy, form]);
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
        dataSource={dataPolicy?.data}
        onChange={handlePagination}
        pagination={{
          current: dataPolicy?.pagination?.currentPage,
          total: dataPolicy?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
        bordered
        scroll={{ y: 650, x: 600 }}
      />
      {idDetails && (
        <ModalUpdatePoLicy
          onClose={() => setIsOpenModal(false)}
          isOpen={isOpenModal}
          form={form}
          handleSubmit={handleUpdatePolicy}
          handleChangeSelect={handleChangeSelect}
          typeSelect={typeSelect}
        />
      )}
    </div>
  );
};

export default TablePolicy;
