/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { FormInstance, Modal } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { ETypeLinkHomepage } from '@/components/FormPolicy/type';

import { BASE_URL } from '@/contants/common.constants';

import FormPost from '..';
interface ModalPostProps {
  onClose: () => void;
  isOpen: boolean;
  form: FormInstance;
  handleSubmit: () => void;
  data: any;
  typeSelect: ETypeLinkHomepage | null | undefined;
  handleChangeSelect: (e: any) => void;
}
const ModalPost = ({
  isOpen,
  onClose,
  form,
  handleSubmit,
  data,
}: ModalPostProps) => {
  const [fileList, setFileList] = useState<any | null>(null);

  const renderHeader = () => {
    return (
      <div
        className='text-center text-[24px]
      font-bold'
      >
        Chỉnh sửa bài viết
      </div>
    );
  };
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

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      categoryId: { label: data?.category?.nameVi, value: data?.category?.id },
    });
    setFileList([data?.thumbnail]);
  }, [data, form]);

  return (
    <Modal
      footer={null}
      visible={isOpen}
      title={renderHeader()}
      destroyOnClose
      closeIcon={<CloseOutlined className='text-[24px]' />}
      onCancel={onClose}
      className='top-[calc(5vh)] w-[calc(70vw)] sm:top-0 sm:w-screen'
    >
      <FormPost
        form={form}
        handleSubmit={handleSubmit}
        fileList={fileList}
        handleSetFileList={handleSetFileList}
      />
    </Modal>
  );
};

export default ModalPost;
