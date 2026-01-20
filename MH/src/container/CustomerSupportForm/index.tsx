/* eslint-disable @next/next/no-img-element */
import { Button, Form, Input } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';

const CustomerSupportForm = () => {
  const [form] = Form.useForm();
  return (
    <div className='m-auto mt-8 h-[958px] w-[1174px] rounded-[70px] bg-[#FBE51D]'>
      <div className='w-full py-7 px-[87px]'>
        <p className='text-center text-[96px] font-bold'>Liên hệ </p>

        <div className='grid grid-cols-3 gap-14'>
          <div className=' grid grid-rows-2 gap-4 rounded-[50px] bg-[white] px-6 py-4 text-center align-middle'>
            <img src='/images/locaiton.svg' alt='x' className='mx-auto' />
            <p className='text-center'>
              Biệt thự Long Cảnh 95, Vinhomes Thăng Long, An Khánh, Hoài Đức, Hà
              Nội
            </p>
          </div>

          <div className='grid grid-rows-2 justify-center gap-4 rounded-[50px] bg-[white] px-6 py-4 text-center'>
            <img src='/images/call.svg' alt='x' className='mx-auto' />
            <div>
              <p className='m-0 p-0 text-center'>19008972</p>
              <p className='text-center'>(+84) 968 02 22 57</p>
            </div>
          </div>

          <div className='grid grid-rows-2 gap-4 rounded-[50px] bg-[white] px-6 py-4'>
            <img src='/images/mail.svg' alt='x' className='mx-auto' />
            <p className='text-center'>acf@gmail.com</p>
          </div>
        </div>

        <Form form={form} className='mt-4'>
          <Form.Item className='fullName'>
            <div>
              <p className='m-0 p-0 font-bold'>Họ và tên :</p>
              <Input className='rounded-[10px]' placeholder='Điền họ và tên' />
            </div>
          </Form.Item>
          <Form.Item className='email'>
            <div>
              <p className='m-0 p-0 font-bold'>Email :</p>
              <Input
                className='rounded-[10px]'
                placeholder='Điền email hoặc số điện thoại'
              />
            </div>
          </Form.Item>
          <Form.Item className='email'>
            <div>
              <p className='m-0 p-0 font-bold'>Tin nhắn :</p>
              <TextArea
                rows={4}
                className='rounded-[10px]'
                placeholder='Viết yêu cầu của quý khách '
              />
            </div>
          </Form.Item>

          <Button className='h-[55px] w-full rounded-[10px] bg-[#493BE2] text-[20px] text-white'>
            Gửi
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default CustomerSupportForm;
