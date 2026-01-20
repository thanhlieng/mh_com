/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, FormInstance, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { QUERY_PARAMS, QueryParams } from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import { getListCategory, getListPost } from '@/services/post.service';
import { mappingCategoryData, mappingPostData } from '@/utils/common-function';

import { EHomePage, ETypeLinkHomepage } from './type';
import VInput from '../common/VInput';
import VSelect from '../common/VSelect';
const { Option } = Select;

interface FormPolicyProps {
  form: FormInstance;
  handleSubmit: () => void;
  typeSelect: ETypeLinkHomepage | null | undefined;
  handleChangeSelect: (e: any) => void;
}
const FormPolicy = ({
  form,
  handleSubmit,
  typeSelect,
  handleChangeSelect,
}: FormPolicyProps) => {
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);

  useEffect(() => {
    form.setFieldsValue({ link: undefined });
  }, [form]);

  const { data: categoriesData, isLoading: isLoadingGetCategories } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY_CREATE_POST, queries],
    () => getListCategory(queries)
  );
  const { data: postsData, isLoading: isLoadingGetPosts } = useQuery(
    [QUERY_POST.GET_LIST_POST, queries],
    () => getListPost(queries)
  );
  const OpitionTypeLink = Object.entries(ETypeLinkHomepage).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const opitionPositionLink = Object.entries(EHomePage).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const renderTypeSelect = (
    typeSelect: ETypeLinkHomepage | null | undefined
  ) => {
    switch (typeSelect || form.getFieldValue('typeLink')) {
      case ETypeLinkHomepage.LINK:
        return (
          <Form.Item
            name='link'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập đường dẫn',
              },
            ]}
          >
            <VInput label='URL của mục' isHorizal />
          </Form.Item>
        );

      case ETypeLinkHomepage.CATEGORY:
        return (
          <Form.Item
            name='link'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn danh mục bài viết',
              },
            ]}
          >
            <VSelect label='Chọn danh mục bài viết' isHorizal showSearch>
              {!isLoadingGetCategories &&
                categoriesData?.data?.map((category) => (
                  <Option key={category.id}>
                    {mappingCategoryData(category, 'vi').name}
                  </Option>
                ))}
            </VSelect>
          </Form.Item>
        );
      case ETypeLinkHomepage.POST:
        return (
          <Form.Item
            name='link'
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn bài viết',
              },
            ]}
          >
            <VSelect label='Chọn bài viết' isHorizal showSearch>
              {!isLoadingGetPosts &&
                postsData?.data?.map((post) => (
                  <Option key={post.id}>
                    {mappingPostData(post, 'vi').title}
                  </Option>
                ))}
            </VSelect>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <Form form={form} className='grid grid-cols-2 gap-x-4'>
      <Form.Item
        name='nameVi'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập nội dung tiếng Việt',
          },
        ]}
      >
        <VInput label='Nội dung (Tiếng Việt)' isHorizal />
      </Form.Item>

      <Form.Item
        name='nameEn'
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập nội dung tiếng Anh',
          },
        ]}
      >
        <VInput label='Nội dung (Tiếng Anh)' isHorizal />
      </Form.Item>

      <Form.Item
        name='typeLink'
        rules={[
          {
            required: true,
            message: 'Vui lòng chọn loại danh mục',
          },
        ]}
      >
        <VSelect
          label='Loại danh mục'
          isHorizal
          onChange={(e) => handleChangeSelect(e)}
        >
          {OpitionTypeLink.map(({ value, label }) => (
            <Option key={value}>{label}</Option>
          ))}
        </VSelect>
      </Form.Item>
      <Form.Item
        name='type'
        rules={[
          {
            required: true,
            message: 'Vui lòng chọn loại vị trí danh mục',
          },
        ]}
      >
        <VSelect label='Vị trí' isHorizal>
          {opitionPositionLink.map(({ value, label }) => (
            <Option key={value}>{label}</Option>
          ))}
        </VSelect>
      </Form.Item>

      <div>{renderTypeSelect(typeSelect)}</div>

      <div className='col-span-2 text-center'>
        <Button onClick={handleSubmit}>Đồng ý</Button>
      </div>
    </Form>
  );
};

export default FormPolicy;
