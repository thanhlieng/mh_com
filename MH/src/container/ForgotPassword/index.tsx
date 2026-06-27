import { Button, Form, Input } from 'antd';
import { Col, Row } from 'antd';
import Image from 'next/image';
import React from 'react';

import styles from './style.module.scss';

import Breadcumb from '@/components/Breadcrumb';

const ForgotPasswordForm = () => {
  return (
    <div className='lg:w-full m-auto w-[1174px]'>
      <div className='lg:w-full float-left w-[905px]'>
        <div className='relative w-full'>
          <Image src='BANNER' height={262} width={905} alt='[image]' />
        </div>
        <Breadcumb />
        <div className='mt-[40px] w-full p-[20px_0]'>
          <Form>
            <div className={styles.forgotPassword}>
              <Row>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name={['user', 'email']}
                    label='Email'
                    rules={[
                      {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                      },
                      {
                        required: true,
                        message: 'Please input your E-mail!',
                      },
                    ]}
                  >
                    <Input placeholder='Please input your E-mail!' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name={['user', 'captcha']}
                    label='Captcha'
                    rules={[{ required: true }]}
                  >
                    <Input type='text' />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
                <Button type='primary' htmlType='submit'>
                  Submit
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
