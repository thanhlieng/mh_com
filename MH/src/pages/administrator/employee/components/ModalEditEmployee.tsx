import { Form, Modal, notification, Tabs } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';

import { QUERY_EMPLOYEE } from '@/contants/query-key/employee.contants';
import { IStaff } from '@/contants/types';
import { updateStaff } from '@/services/employee.services';

import FormEditEmployee from './FormEditEmployee';
import PermissonEmployee from './PermissionEmployee';

interface IProps {
  onClose: (value: boolean) => void;
  value?: IStaff;
}
const ModalEditEmployee = ({ onClose, value }: IProps) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate: mutateCreate, isLoading: isCreating } = useMutation(
    updateStaff,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_EMPLOYEE.GET_EMPLOYEE);
        notification.success({
          message: 'Cập nhật tài khoản thành công',
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
    }
  );

  const onSubmit = async () => {
    const requestData: IStaff = await form.validateFields();
    mutateCreate({
      id: value?.id || '',
      data: {
        ...requestData,
        placeOfBirth: requestData.placeOfBirth?.toString(),
        religion: requestData.religion?.toString(),
      },
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      ...value,
      dayOfBirth: moment(value?.dayOfBirth || undefined),
      issueDate: moment(value?.issueDate || undefined),
      insuranceParticipationDate: moment(
        value?.insuranceParticipationDate || undefined
      ),
      issueInsuranceDate: moment(value?.issueInsuranceDate || undefined),
      latestPromotionDate: moment(value?.latestPromotionDate || undefined),
      files: value?.files ?? form.getFieldValue('files'),
    });
  }, [form, value]);
  return (
    <Modal
      footer={null}
      visible={true}
      title={
        <HeaderModal
          title='Cập nhật nhân viên'
          onClose={() => onClose(false)}
        />
      }
      closable={false}
      onCancel={() => onClose(false)}
      className='top-[20px] w-[calc(70vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
    >
      <div>
        <Tabs>
          <Tabs.TabPane tab='Thông tin chung' key='form-information'>
            <FormEditEmployee
              form={form}
              onSubmit={onSubmit}
              isCreating={isCreating}
              id={value?.userId}
              employeeData={value}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab='Phân quyền' key='permission'>
            <PermissonEmployee id={value?.id || ''} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default ModalEditEmployee;
