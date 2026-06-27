/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Modal, notification, Tabs } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';

import { QUERY_CUSTOMER } from '@/contants/query-key/customer.contants';
import { ICustomer } from '@/contants/types';
import useGetPermission from '@/hook/getPermission';
import { generateOrderCode } from '@/services/booking.services';
import { updateCustomer } from '@/services/customer.services';
import { resetPass } from '@/services/post.service';

import { USER } from '@/contants/Storage';

import ContractCustomer from '../ContractCustomer/ContractCustomer';
import InfoCustomer from '../InfoCustomer/InfoCustomer';
import InFoNew from '../InfoNew/InforNew';
import InfoStaff from '../InfoStaff/InfoStaff';
import MhvnConnect from '../MhvnConnect/MhvnConnect';
import OrdersCode from '../OrdersCode/OrdersCode';

interface IProps {
  onClose: (value: boolean) => void;
  value?: ICustomer;
}
const ModalEditCustomer = ({ onClose, value }: IProps) => {
  const { permissions } = useGetPermission();
  const isAdmin = (() => {
    try {
      const raw =
        typeof window !== 'undefined' ? (localStorage.getItem(USER) ?? '') : '';
      console.error(JSON.parse(raw)?.typeUser);
      return raw
        ? (JSON.parse(raw)?.typeUser as string).toLocaleLowerCase() === 'admin'
        : false;
    } catch {
      return false;
    }
  })();
  const [form] = Form.useForm();
  const [detailsContract, setDetailsContract] = useState<Array<any>>([]);
  const [infoStaff, setInfoStaff] = useState<Array<any>>([]);
  const [detailsOrder, setDetailsOrder] = useState<Array<any>>([]);
  const [formReset] = useForm();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { mutate: rsPass } = useMutation(resetPass, {
    onSuccess: () => {
      notification.success({
        message: 'Đổi mật khẩu thành công',
        placement: 'top',
      });
      formReset.resetFields();
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data
            ? e.response.data.message
            : 'Có lỗi vui lòng thử lại sau'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: genOrderCode, isLoading: generateSmallBillLoading } =
    useMutation(generateOrderCode, {
      onSuccess: () => {
        queryClient.invalidateQueries(['generateInVoice']);
        notification.success({
          message: 'Tải xuống thành công',
          placement: 'top',
        });
      },
      onError: () => {
        notification.error({
          message: 'Tải xuống thất bại',
          placement: 'top',
        });
      },
    });
  const handleAddContract = (data: any) => {
    setDetailsContract((prev) => [...prev, data]);
  };

  const { mutate: mutateCreate, isLoading: isCreating } = useMutation(
    updateCustomer,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_CUSTOMER.GET_CUSTOMER);
        notification.success({
          message: 'Cập nhật khách hàng thành công',
          placement: 'top',
        });
        onClose(false);
      },
      onError: () => {
        notification.error({
          message: 'Something went wrong',
          placement: 'top',
        });
      },
    },
  );

  const onSubmit = async () => {
    const requestData: any = await form.validateFields();
    const res = {
      ...value,
      ...requestData,
      contract: detailsContract.map((newRes) => {
        const { contactTerm, timeAplly, ...detailsContract } = newRes;
        return {
          ...detailsContract,
          expertise: detailsContract.expertise === 1 ? true : false,
          contractTermFrom: moment(contactTerm[0]).format('YYYY-MM-DD'),
          contractTermTo: moment(contactTerm[1]).format('YYYY-MM-DD'),
        };
      }),
      managementStaff: infoStaff,
      priceList: detailsOrder.map((v) => {
        const { timeApply, ...resDetails } = v;
        return {
          ...resDetails,
          timeApplyFrom: moment(timeApply[0]).format('YYYY-MM-DD'),
          timeApplyTo: moment(timeApply[1]).format('YYYY-MM-DD'),
          surcharge: resDetails.surcharge.toString(),
        };
      }),
    };

    const {
      id,
      customerCode,
      staffId,
      userId,
      gender,
      dob,
      createdAt,
      updatedAt,
      user,
      staff,
      unit,
      company,
      ...resNew
    } = res;
    mutateCreate({
      id: value?.id || '',
      data: resNew,
    });
  };

  const handleAddStaff = (data: any) => {
    setInfoStaff((prev) => [...prev, data]);
  };
  const onSubmitReset = async () => {
    if (value?.id) {
      const res = await formReset.validateFields();
      rsPass({
        id: value.userId as string,
        password: res.password,
      });
    }
  };
  useEffect(() => {
    form.setFieldsValue({
      ...value,
    });
    if (value?.openDate) {
      form.setFieldValue('openDate', moment(value.openDate));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    const contactF = value.contract.map((v) => ({
      ...v,
      contactTerm: [v.contractTermFrom, v.contractTermTo],
    }));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    setInfoStaff(value?.managementStaff || []);
    setDetailsContract(contactF);

    setDetailsOrder(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      value?.priceList.map((v: any) => ({
        ...v,
        timeApply: [v.timeApplyFrom, v.timeApplyTo],
      })),
    );
  }, [form, value]);

  const handleDeleteStaff = (id: any) => {
    const res = infoStaff.filter((x, index) => id !== index);
    setInfoStaff(res);
  };
  const handleUpdateContract = (data: any) => {
    setDetailsContract(data);
  };
  const handleDeleteContract = (id: any) => {
    const res = detailsOrder.filter((x, index) => id !== index);
    setDetailsOrder(res);
  };

  const handleUpdateStaff = (data: any) => {
    setInfoStaff(data);
  };

  const handleAddOrder = (data: any) => {
    setDetailsOrder((prev) => [...prev, data]);
  };

  const handleUpdateOrder = (data: any) => {
    setDetailsOrder(data);
  };

  const handleGenOrderCode = () => {
    if (value?.id) {
      genOrderCode(value?.id);
    }
  };

  return (
    <Modal
      footer={null}
      visible
      title={
        <HeaderModal
          title=' Sửa thông tin khách hàng'
          onClose={() => onClose(false)}
        />
      }
      closeIcon={<CloseOutlined className='text-[24px]' />}
      onCancel={() => onClose(false)}
      closable={false}
      className='top-[calc(5vh)] w-[calc(60vw)]'
    >
      <div>
        {permissions?.includes('get_private_informaion_customer') ||
        permissions?.includes('get_all_list_customer') ? (
          <Tabs type='card'>
            <Tabs.TabPane tab='Thông tin chung' key='infoCustomer'>
              <InfoCustomer form={form} />
            </Tabs.TabPane>
            <Tabs.TabPane tab='Hợp đồng' key='Contract'>
              <ContractCustomer
                form={form}
                detailsContract={detailsContract}
                handleAddContract={handleAddContract}
                handleDeleteContract={handleDeleteContract}
                handleUpdateContract={handleUpdateContract}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab='Bảng giá' key='Orderss'>
              <OrdersCode
                // form={form}
                detailsOrder={detailsOrder}
                handleAddOrder={handleAddOrder}
                handleUpdateOrder={handleUpdateOrder}
                handleDeleteContract={handleDeleteContract}
                handleGenOrderCode={handleGenOrderCode}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab='Chi tiết' key='DetailsCustomer'>
              <InFoNew form={form} />
            </Tabs.TabPane>
            <Tabs.TabPane tab='Thông tin nhân viên' key='InfoStaff'>
              <InfoStaff
                handleDelete={handleDeleteStaff}
                form={form}
                infoStaff={infoStaff}
                handleAddStaff={handleAddStaff}
                handleUpdateStaff={handleUpdateStaff}
              />
            </Tabs.TabPane>
            {isAdmin && (
              <Tabs.TabPane tab='Kết nối mhvn' key='MhvnConnect'>
                <MhvnConnect userId={value?.userId} />
              </Tabs.TabPane>
            )}
          </Tabs>
        ) : (
          <Tabs type='card'>
            <Tabs.TabPane tab='Thông tin chung' key='infoCustomer'>
              <InfoCustomer form={form} />
            </Tabs.TabPane>
          </Tabs>
        )}
      </div>
      <Modal
        footer={null}
        visible={isOpen}
        title={
          <HeaderModal
            title='Cập nhật mật khẩu khách hàng'
            onClose={() => setIsOpen(false)}
          />
        }
        closable={false}
        onCancel={() => setIsOpen(false)}
        className='top-[20px] w-[calc(50vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
      >
        <Form form={formReset}>
          <Form.Item name='password'>
            <VInput
              label='Mật khẩu mới'
              placeholder='Nhập mật khẩu'
              isHorizal
            />
          </Form.Item>
        </Form>
        <div className='flex justify-center gap-4'>
          <Button danger onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button type='primary' onClick={onSubmitReset}>
            Đồng ý{' '}
          </Button>
        </div>
      </Modal>

      <div className='mt-4 flex justify-start gap-2'>
        <Button
          onClick={onSubmit}
          loading={isCreating}
          htmlType='submit'
          type='primary'
        >
          Cập nhật thông tin khách hàng
        </Button>

        {permissions?.includes('reset_password') && (
          <Button
            onClick={() => setIsOpen(true)}
            // loading={isCreating}
            htmlType='submit'
            type='primary'
          >
            Cập nhật mật khẩu
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default ModalEditCustomer;
