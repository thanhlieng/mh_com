/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { FormInstance, Modal, notification } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { BASE_URL } from '@/contants/common.constants';
import { QUERY_POST } from '@/contants/query-key/post.query';
import { updateCategoryDetails } from '@/services/post.service';

import FormCategoryPost from '..';

interface ModalFormCategoryPostProps {
  onClose: () => void;
  isOpen: boolean;
  form: FormInstance;
  data: any;
  idDetails?: string;
}
const ModalFormCategoryPost = ({
  onClose,
  isOpen,
  form,
  data,
  idDetails,
}: ModalFormCategoryPostProps) => {
  const [fileList, setFileList] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { mutate: updateCatergory } = useMutation(updateCategoryDetails, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_POST.GET_LIST_CATEGORY]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
      form.resetFields();
      onClose();
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

  const renderHeader = () => {
    return (
      <div
        className=' text-center text-[24px]
      font-bold'
      >
        Chỉnh sửa bài viết
      </div>
    );
  };

  useEffect(() => {
    form.setFieldsValue({
      ...data,
    });
    setFileList([data?.thumbnail]);
  }, [data, form]);

  const handleSubmit = async () => {
    const res = await form.validateFields();

    updateCatergory({ id: idDetails, params: { ...res } });
  };

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
      <FormCategoryPost
        form={form}
        handleSubmit={handleSubmit}
        handleSetFileList={handleSetFileList}
        fileList={fileList}
      />
    </Modal>
  );
};

export default ModalFormCategoryPost;
