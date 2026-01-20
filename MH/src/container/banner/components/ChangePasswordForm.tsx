import { Form, FormInstance } from 'antd';
import useTranslation from 'next-translate/useTranslation';

import VInput from '@/components/common/VInput';

const ChangePasswordForm = ({ form }: { form: FormInstance }) => {
  const { t } = useTranslation('common');
  return (
    <Form form={form}>
      <Form.Item
        name='oldPassword'
        rules={[
          {
            required: true,
            message: t('plsInputPassword'),
          },
        ]}
      >
        <VInput label={t('oldPassword')} isHorizal type='password' />
      </Form.Item>
      <Form.Item
        name='newPassword'
        rules={[
          {
            required: true,
            message: t('plsInputNewPassword'),
          },
        ]}
      >
        <VInput label={t('newPassword')} isHorizal type='password' />
      </Form.Item>
      <Form.Item
        name='confirmPassword'
        rules={[
          {
            required: true,
            message: t('plsInputConfirmPassword'),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(t('Password confirmation does not match'))
              );
            },
          }),
        ]}
      >
        <VInput label={t('confirmPassword')} isHorizal type='password' />
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
