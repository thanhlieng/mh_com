/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  notification,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import * as React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import {
  createQualityReport,
  updateQualityReport,
  type QualityReport,
  type QualityReportPayload,
} from '@/services/supplier.services';

import { SEVERITY_OPTIONS } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Truyền vào khi sửa; bỏ trống khi tạo mới. */
  editing?: QualityReport | null;
}

interface FormValues {
  ngay_phat_sinh?: Dayjs | null;
  khach_hang?: string;
  mo_ta_loi?: string;
  anh_huong_cu_the?: string;
  muc_do?: 'low' | 'high' | 'urgent';
  nguyen_nhan_goc_re?: string;
  bien_phap_khac_phuc?: string;
  bien_phap_phong_ngua?: string;
  deadline_xu_ly?: Dayjs | null;
  ngay_hoan_thanh?: Dayjs | null;
  ghi_chu?: string;
}

const toIso = (d?: Dayjs | null) => (d ? d.toISOString() : null);
const fromIso = (s?: string | null) => (s ? dayjs(s) : null);

const QualityReportFormModal: React.FC<Props> = ({
  open,
  onClose,
  editing,
}) => {
  const [form] = Form.useForm<FormValues>();
  const queryClient = useQueryClient();
  const isEdit = !!editing;

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        ngay_phat_sinh: fromIso(editing.ngay_phat_sinh),
        khach_hang: editing.khach_hang,
        mo_ta_loi: editing.mo_ta_loi,
        anh_huong_cu_the: editing.anh_huong_cu_the,
        muc_do: editing.muc_do,
        nguyen_nhan_goc_re: editing.nguyen_nhan_goc_re,
        bien_phap_khac_phuc: editing.bien_phap_khac_phuc,
        bien_phap_phong_ngua: editing.bien_phap_phong_ngua,
        deadline_xu_ly: fromIso(editing.deadline_xu_ly),
        ngay_hoan_thanh: fromIso(editing.ngay_hoan_thanh),
        ghi_chu: editing.ghi_chu,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ muc_do: 'low' });
    }
  }, [open, editing, form]);

  const mutation = useMutation(
    (payload: QualityReportPayload) =>
      isEdit && editing
        ? updateQualityReport(editing.id, payload)
        : createQualityReport(payload),
    {
      onSuccess: () => {
        notification.success({
          message: isEdit ? 'Đã cập nhật báo cáo' : 'Đã gửi báo cáo',
          placement: 'top',
        });
        queryClient.invalidateQueries(['quality-reports']);
        onClose();
      },
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message ||
            e?.response?.data?.detail ||
            'Lưu báo cáo thất bại',
          placement: 'top',
        });
      },
    },
  );

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields();
      const payload: QualityReportPayload = {
        ngay_phat_sinh: toIso(v.ngay_phat_sinh),
        khach_hang: v.khach_hang ?? '',
        mo_ta_loi: v.mo_ta_loi ?? '',
        anh_huong_cu_the: v.anh_huong_cu_the ?? '',
        muc_do: v.muc_do ?? 'low',
        nguyen_nhan_goc_re: v.nguyen_nhan_goc_re ?? '',
        bien_phap_khac_phuc: v.bien_phap_khac_phuc ?? '',
        bien_phap_phong_ngua: v.bien_phap_phong_ngua ?? '',
        deadline_xu_ly: toIso(v.deadline_xu_ly),
        ngay_hoan_thanh: toIso(v.ngay_hoan_thanh),
        ghi_chu: v.ghi_chu ?? '',
      };
      mutation.mutate(payload);
    } catch {
      /* validation error đã được antd hiển thị */
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa báo cáo chất lượng' : 'Gửi báo cáo chất lượng'}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEdit ? 'Cập nhật' : 'Gửi báo cáo'}
      cancelText='Hủy'
      confirmLoading={mutation.isLoading}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout='vertical'>
        <div className='grid grid-cols-1 gap-x-4 md:grid-cols-2'>
          <Form.Item
            name='ngay_phat_sinh'
            label='Ngày phát sinh'
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <DatePicker
              showTime
              className='w-full'
              format='DD/MM/YYYY HH:mm'
            />
          </Form.Item>
          <Form.Item name='khach_hang' label='Khách hàng'>
            <Input placeholder='Tên khách hàng liên quan' />
          </Form.Item>
          <Form.Item
            name='mo_ta_loi'
            label='Mô tả lỗi'
            className='md:col-span-2'
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='Mô tả lỗi'
            />
          </Form.Item>
          <Form.Item
            name='anh_huong_cu_the'
            label='Ảnh hưởng cụ thể'
            className='md:col-span-2'
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='Ảnh hưởng cụ thể'
            />
          </Form.Item>
          <Form.Item
            name='muc_do'
            label='Mức độ'
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <Select options={SEVERITY_OPTIONS} placeholder='Chọn mức độ' />
          </Form.Item>
          <Form.Item name='deadline_xu_ly' label='Deadline xử lý'>
            <DatePicker
              showTime
              className='w-full'
              format='DD/MM/YYYY HH:mm'
            />
          </Form.Item>
          <Form.Item
            name='nguyen_nhan_goc_re'
            label='Nguyên nhân gốc rễ'
            className='md:col-span-2'
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='Nguyên nhân gốc rễ'
            />
          </Form.Item>
          <Form.Item
            name='bien_phap_khac_phuc'
            label='Biện pháp khắc phục'
            className='md:col-span-2'
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='Biện pháp khắc phục'
            />
          </Form.Item>
          <Form.Item
            name='bien_phap_phong_ngua'
            label='Biện pháp phòng ngừa'
            className='md:col-span-2'
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='Biện pháp phòng ngừa'
            />
          </Form.Item>
          <Form.Item name='ngay_hoan_thanh' label='Ngày hoàn thành'>
            <DatePicker
              showTime
              className='w-full'
              format='DD/MM/YYYY HH:mm'
            />
          </Form.Item>
          <Form.Item name='ghi_chu' label='Ghi chú'>
            <Input placeholder='Ghi chú' />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default QualityReportFormModal;
