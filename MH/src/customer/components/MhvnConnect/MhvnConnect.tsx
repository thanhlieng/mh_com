/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Button, Radio, Select, Spin, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import {
  ALinkType,
  getAccountLinksByUser,
  getMhvnCustomers,
  getMhvnSuppliers,
  MhvnDirectoryEntity,
  setAccountLinksByUser,
} from '@/services/supplier.services';

interface IProps {
  /** userId của account khách hàng đang sửa (ICustomer.userId). */
  userId?: string;
}

const buildOptions = (rows: MhvnDirectoryEntity[] = []) =>
  rows.map((r) => ({
    value: String(r.id),
    label: r.tax_number
      ? `${r.company_name} — ${r.tax_number}`
      : r.company_name,
  }));

/**
 * Tab "Kết nối mhvn": chọn account hiện tại liên kết với nhiều supplier HOẶC
 * nhiều customer bên mhvn (chỉ một loại tại một thời điểm).
 */
const MhvnConnect = ({ userId }: IProps) => {
  const [linkType, setLinkType] = useState<ALinkType>('supplier');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Liên kết hiện tại của account.
  const { isLoading: loadingLinks } = useQuery(
    ['account-links-by-user', userId],
    () => getAccountLinksByUser(userId as string),
    {
      enabled: !!userId,
      onSuccess: (data) => {
        if (data?.linkType) {
          setLinkType(data.linkType);
        }
        setSelectedIds(data?.ids ?? []);
      },
    }
  );

  // Danh mục supplier / customer bên mhvn (tải theo loại đang chọn).
  const { data: suppliersData, isFetching: loadingSuppliers } = useQuery(
    ['mhvn-suppliers'],
    () => getMhvnSuppliers(),
    { enabled: !!userId && linkType === 'supplier', staleTime: 5 * 60 * 1000 }
  );
  const { data: customersData, isFetching: loadingCustomers } = useQuery(
    ['mhvn-customers'],
    () => getMhvnCustomers(),
    { enabled: !!userId && linkType === 'customer', staleTime: 5 * 60 * 1000 }
  );

  const options = useMemo(
    () =>
      linkType === 'supplier'
        ? buildOptions(suppliersData?.suppliers)
        : buildOptions(customersData?.customers),
    [linkType, suppliersData, customersData]
  );

  const { mutate: save, isLoading: saving } = useMutation(
    () =>
      setAccountLinksByUser(userId as string, {
        linkType: selectedIds.length ? linkType : null,
        ids: selectedIds,
      }),
    {
      onSuccess: (data) => {
        setSelectedIds(data?.ids ?? []);
        notification.success({
          message: 'Cập nhật liên kết mhvn thành công',
          placement: 'top',
        });
      },
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message ||
            'Cập nhật liên kết mhvn thất bại',
          placement: 'top',
        });
      },
    }
  );

  // Đổi loại liên kết → xoá lựa chọn hiện tại (không thể giữ cả 2 loại).
  const handleChangeType = (value: ALinkType) => {
    setLinkType(value);
    setSelectedIds([]);
  };

  useEffect(() => {
    // reset khi đổi account
    setSelectedIds([]);
    setLinkType('supplier');
  }, [userId]);

  if (!userId) {
    return (
      <Alert
        type='warning'
        showIcon
        message='Khách hàng này chưa có tài khoản đăng nhập, không thể liên kết với mhvn.'
      />
    );
  }

  const optionsLoading =
    linkType === 'supplier' ? loadingSuppliers : loadingCustomers;

  return (
    <Spin spinning={loadingLinks}>
      <div className='flex flex-col gap-4'>
        <Alert
          type='info'
          showIcon
          message='Một tài khoản chỉ được liên kết với một loại (nhà cung cấp HOẶC khách hàng), nhưng có thể chọn nhiều thực thể cùng loại.'
        />

        <div>
          <div className='mb-1 font-medium'>Loại liên kết</div>
          <Radio.Group
            value={linkType}
            onChange={(e) => handleChangeType(e.target.value)}
          >
            <Radio.Button value='supplier'>Nhà cung cấp (Supplier)</Radio.Button>
            <Radio.Button value='customer'>Khách hàng (Customer)</Radio.Button>
          </Radio.Group>
        </div>

        <div>
          <div className='mb-1 font-medium'>
            {linkType === 'supplier'
              ? 'Chọn nhà cung cấp bên mhvn'
              : 'Chọn khách hàng bên mhvn'}
          </div>
          <Select
            mode='multiple'
            className='w-full'
            placeholder='Tìm và chọn...'
            value={selectedIds}
            onChange={(v: string[]) => setSelectedIds(v)}
            options={options}
            loading={optionsLoading}
            optionFilterProp='label'
            showSearch
            allowClear
            maxTagCount='responsive'
          />
        </div>

        <div className='flex justify-start'>
          <Button type='primary' loading={saving} onClick={() => save()}>
            Lưu liên kết
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default MhvnConnect;
