/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, notification, Select } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import VSelect from '@/components/common/VSelect';
import FormCategoryPost from '@/components/FormCategoryPost';
import TableCategoryPost from '@/components/FormCategoryPost/TableCategoryPost';
import FormPolicy from '@/components/FormPolicy';
import TablePolicy from '@/components/FormPolicy/TablePolicy';
import { ETypeLinkHomepage } from '@/components/FormPolicy/type';
import FormPost from '@/components/FormPost';
import TablePost from '@/components/FormPost/TablePost';

import { BASE_URL } from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import {
  createCategoryPostService,
  createItemHomepageService,
  createPostService,
} from '@/services/post.service';
const queryKey = 'fetchData';

const opition = [
  { label: 'Home Page', value: '1' },
  { label: 'Bài viết', value: '2' },
  { label: 'Danh mục bài viết', value: '3' },
];
const HomeManagerContainer = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [typeSelect, setTypeSelect] = useState<
    ETypeLinkHomepage | null | undefined
  >();
  const [fileList, setFileList] = useState<any | null>(null);

  const [selected, setSelected] = useState<string>('1');

  const handleSubmitCreateCategoryPost = async () => {
    const res = await form.validateFields();
    return createCategoryPost(res);
  };

  const handleSubmitCreatePost = async () => {
    const res = await form.validateFields();
    return createPost(res);
  };

  const handleSubmitCreateHomepage = async () => {
    const res = await form.validateFields();
    return createItemHomepage(res);
  };

  const { mutate: createCategoryPost } = useMutation(
    createCategoryPostService,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_POST.CREATE_CATEGORY_POST]);
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
    }
  );

  const { mutate: createItemHomepage } = useMutation(
    createItemHomepageService,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_POST.CREATE_HOMEPAGE]);
        notification.success({
          message: 'Tạo mới thành công',
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
    }
  );

  const { mutate: createPost } = useMutation(createPostService, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_POST.CREATE_POST]);
      notification.success({
        message: 'Tạo mới bài viết thành công',
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

  const handleSetFileList = async (data: any) => {
    if (data.length > 0) {
      const files = data ? [...data] : [];
      const dataUpload = new FormData();
      files.forEach((file, i) => {
        dataUpload.append(`files`, file, file.name);
      });
      const upload = await axios({
        method: 'POST',
        url: `${BASE_URL}/upload-file`,
        data: dataUpload,
      });
      if (upload.data.data.length) {
        form.setFieldsValue({
          thumbnail: upload.data.data[0],
        });
        setFileList([upload.data.data[0]]);
      }
    }
  };

  const renderSelect = (selected: string) => {
    switch (selected) {
      case '1':
        return (
          <>
            <TablePolicy />
            <FormPolicy
              form={form}
              handleSubmit={handleSubmitCreateHomepage}
              typeSelect={typeSelect}
              handleChangeSelect={(e) => setTypeSelect(e)}
            />
          </>
        );

      case '2':
        return (
          <>
            <TablePost
              typeSelect={typeSelect}
              handleChangeSelect={(e) => setTypeSelect(e)}
            />
            <FormPost
              form={form}
              handleSetFileList={handleSetFileList}
              fileList={fileList}
              handleSubmit={handleSubmitCreatePost}
            />
          </>
        );

      default:
        return (
          <>
            <TableCategoryPost />
            <FormCategoryPost
              form={form}
              handleSetFileList={handleSetFileList}
              fileList={fileList}
              handleSubmit={handleSubmitCreateCategoryPost}
            />
          </>
        );
    }
  };

  return (
    <div className='grid gap-4'>
      <VSelect
        label='Chọn Loại danh mục'
        className='w-[550px] rounded-sm'
        onChange={(e) => setSelected(e)}
      >
        {opition.map((v) => (
          <Select.Option value={v.value} key={v.value}>
            {v.label}
          </Select.Option>
        ))}
      </VSelect>
      <div className='overflow-auto'>{renderSelect(selected)}</div>
    </div>
  );
};

export default HomeManagerContainer;
