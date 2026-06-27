/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, FormInstance, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import {
  QUERY_PARAMS,
  QueryParams,
  UPLOAD_ENDPOINT,
} from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import { getListCategory } from '@/services/post.service';
import { mappingCategoryData } from '@/utils/common-function';

import VInput from '../common/VInput';
import VSelect from '../common/VSelect';
import FileUpload from '../FileUpLoad';

interface FormPostProps {
  form: FormInstance;
  handleSetFileList: (data: any) => void;
  fileList: any;
  handleSubmit: () => void;
}

const { Option } = Select;

const FormPost = ({
  form,
  fileList,
  handleSetFileList,
  handleSubmit,
}: FormPostProps) => {
  const editorRef = useRef<any>();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, ClassicEditor } = editorRef.current || {};

  // Xử lý logic tìm danh mục để tạo bài viết
  const [queries, setQueries] = useState<QueryParams>(QUERY_PARAMS);
  const { data: categoriesData, isLoading } = useQuery(
    [QUERY_POST.GET_LIST_CATEGORY_CREATE_POST, queries],
    () => getListCategory(queries)
  );

  useEffect(() => {
    editorRef.current = {
      // CKEditor: require('@ckeditor/ckeditor5-react'), // depricated in v3
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
    };
    setEditorLoaded(true);
  }, []);

  return editorLoaded && !isLoading ? (
    <Form form={form} className='grid grid-cols-2 gap-x-4'>
      <Form.Item name='categoryId'>
        <VSelect label='Chọn danh mục bài viết' isHorizal showSearch>
          {categoriesData?.data?.map((category) => (
            <Option key={category.id}>
              {mappingCategoryData(category, 'vi').name}
            </Option>
          ))}
        </VSelect>
      </Form.Item>
      <Form.Item name='titleVi'>
        <VInput label='Tiêu đề tiếng Việt' isHorizal />
      </Form.Item>

      <Form.Item name='titleEn'>
        <VInput label='Tiêu đề tiếng Anh' isHorizal />
      </Form.Item>

      <Form.Item name='descriptionVi'>
        <VInput label='Mô tả tiếng Việt' isHorizal />
      </Form.Item>

      <Form.Item name='descriptionEn'>
        <VInput label='Mô tả tiếng Anh' isHorizal />
      </Form.Item>

      <Form.Item name='thumbnail' className='grid gap-2'>
        <p className='m-0 mb-1 p-0'>File</p>
        <FileUpload handleSetFileList={handleSetFileList} fileList={fileList} />
      </Form.Item>
      <Form.Item name='contentVi'>
        <p className='font-semibold'>Content bài viết tiếng Việt</p>
        <CKEditor
          editor={ClassicEditor}
          data={form.getFieldValue('contentVi')}
          onChange={(_: any, editor: any) => {
            form.setFieldsValue({
              contentVi: editor.getData(),
            });
          }}
          config={{
            ckfinder: {
              uploadUrl: UPLOAD_ENDPOINT,
            },
          }}
        />
      </Form.Item>

      <Form.Item name='contentEn'>
        <p className='font-semibold'>Content bài viết tiếng Anh</p>
        <CKEditor
          editor={ClassicEditor}
          data={form.getFieldValue('contentEn')}
          onChange={(_: any, editor: any) => {
            form.setFieldsValue({
              contentEn: editor.getData(),
            });
          }}
          config={{
            ckfinder: {
              uploadUrl: UPLOAD_ENDPOINT,
            },
          }}
        />
      </Form.Item>

      <div className='col-span-2 text-center'>
        <Button onClick={handleSubmit}>Đồng ý</Button>
      </div>
    </Form>
  ) : (
    <></>
  );
};

export default FormPost;
