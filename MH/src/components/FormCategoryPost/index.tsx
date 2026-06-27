import { Button, Form } from 'antd';

import { FormCategoryPostProps } from './type';
import VInput from '../common/VInput';
import FileUpload from '../FileUpLoad';

const FormCategoryPost = ({
  form,
  handleSetFileList,
  fileList,
  handleSubmit,
}: FormCategoryPostProps) => {
  return (
    <Form form={form} className='grid grid-cols-2 gap-4'>
      <Form.Item name='nameVi'>
        <VInput isHorizal label='Tên danh mục bài viết (Tiếng việt)' required />
      </Form.Item>
      <Form.Item name='nameEn'>
        <VInput isHorizal label='Tên danh mục bài viết (Tiếng anh)' required />
      </Form.Item>
      <Form.Item name='thumbnail' className='grid gap-2'>
        <p className='m-0 mb-1 p-0'>File</p>
        <FileUpload handleSetFileList={handleSetFileList} fileList={fileList} />
      </Form.Item>

      <div className='col-span-2 text-center'>
        <Button onClick={handleSubmit}>Đồng ý</Button>
      </div>
    </Form>
  );
};

export default FormCategoryPost;
