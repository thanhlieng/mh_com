/* eslint-disable @typescript-eslint/no-empty-function */
import { Form } from 'antd';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

const RegisterForSale = () => {
  const { t } = useTranslation('common');

  const [form] = Form.useForm();
  const handleRegister = () => {};
  return (
    <div className=' flex flex-row gap-[48px]'>
      <div>
        <Image src='/images/assis.png' width={40} height={60} />
      </div>
      <div>
        <p className='m-0 p-0'>HỖ TRỢ SIÊU TỐC</p>
        <p className='m-0 p-0'>– Điện thoại: 0868 181 216</p>
        <p className='m-0 p-0'>– Email: mh@minhhuylog.vn</p>
      </div>
    </div>
  );
};

export default RegisterForSale;
