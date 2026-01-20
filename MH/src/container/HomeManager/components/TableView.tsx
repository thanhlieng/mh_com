/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Col, Divider, Row } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface TableViewProps {
  data: Array<any>;
}
const renderTitle = (title: string) => {
  return (
    <div className='flex flex-row items-center gap-[10px] '>
      <Image src='/images/box.svg' width={26} height={26} alt='' />
      <p className='m-0 p-0 text-[12px] leading-[15px]'>{title}</p>
    </div>
  );
};
const TableView = ({ data }: TableViewProps) => {
  return (
    <div className='mx-auto px-[235px] text-[14px] leading-[17px] xs:px-[15px] sm:w-full sm:px-[45px]'>
      <div className='xs:hidden'>
        <Row className='h-[37px]  rounded-tl-[10px] rounded-tr-[10px] border-r-[1px] border-[#1464a9] bg-[#FFF2E2] text-[#1464a9]'>
          <Col
            xs={2}
            className='flex h-full w-full items-center justify-center rounded-tl-[10px] border-[1px] border-[#1464a9]'
          >
            <p className=' leading-[17px]m-0 p-0 text-center text-[14px] font-bold'>
              STT
            </p>
          </Col>
          <Col
            xs={6}
            className='flex h-full w-full items-center justify-center border-[1px] border-[#1464a9]'
          >
            <p className=' leading-[17px]m-0 p-0 text-center text-[14px] font-bold'>
              Mã bill
            </p>
          </Col>
          <Col
            xs={8}
            className='flex h-full w-full items-center justify-center border-[1px] border-[#1464a9] '
          >
            <p className=' leading-[17px]m-0 p-0 text-center text-[14px] font-bold'>
              Gửi từ{' '}
            </p>
          </Col>
          <Col
            xs={8}
            className='flex h-full w-full items-center justify-center rounded-tr-[10px] border-[1px] border-[#1464a9]'
          >
            <p className=' leading-[17px]m-0 p-0 text-center text-[14px] font-bold'>
              Gửi đến
            </p>
          </Col>
        </Row>

        <div className='border-r-[1px] border-[#DBDBDB]'>
          {data.map((v, i) => {
            return (
              <Row key={v.booking_id} className='  bg-[#fff]'>
                <Col xs={2} className=' border-[1px] p-5'>
                  <p className=' leading-[17px]m-0 p-0 text-center text-[14px]'>
                    {i}
                  </p>
                </Col>
                <Col xs={6} className='border-[1px] p-5'>
                  <p className=' cate m-0 break-words p-0 text-center text-[14px] leading-[17px]'>
                    {v.booking_code}
                  </p>
                </Col>

                <Col xs={8} className='border-[1px] p-5'>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.sender_name_en}
                  </p>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.sender_contact_person}
                  </p>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.sender_phone_number}
                  </p>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.sender_postal_code && (
                      <span>{`${v.sender_postal_code},`}</span>
                    )}
                    {v.sender_province && (
                      <span>{`${v.sender_province},`}</span>
                    )}
                    {v.sender_country && <span>{`${v.sender_country}`}</span>}
                  </p>
                </Col>

                <Col xs={8} className='border-[1px] p-5'>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.receiver_name}
                  </p>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.receiver_contact_person}
                  </p>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.receiver_phone_number}
                  </p>
                  <p className=' leading-[17px]m-0 break-words p-0 text-[14px]'>
                    {v.receiver_postal_code && (
                      <span>{`${v.receiver_postal_code},`}</span>
                    )}
                    {v.receiver_province && (
                      <span>{`${v.receiver_province},`}</span>
                    )}
                    {v.receiver_country && (
                      <span>{`${v.receiver_country}`}</span>
                    )}
                  </p>
                </Col>
              </Row>
            );
          })}
        </div>

        <div className='mt-5 flex flex-row items-center justify-end'>
          <Link href='/manager/booking'>
            <button className='h-[38px] w-[100px] rounded-[10px] bg-[#F5F5F5]  font-medium text-[#1F1F1F]  outline-0'>
              Xem tất cả
            </button>
          </Link>
        </div>
      </div>

      <div className='hidden gap-[12px] xs:grid'>
        {data.map((v) => (
          <Card
            title={renderTitle(v.booking_code)}
            className='rounded-[10px]'
            key={v.booking_code}
          >
            <p className='text-[12px] leading-[15px] text-[#6F6D6D]'>Gửi từ</p>
            <p className='grid text-[12px] leading-[15px] text-[#1f1f1f]'>
              <span>{v.sender_name_en}</span>
              <span> {v.sender_contact_person}</span>
              <span> {v.sender_phone_number}</span>
              <span>
                {v.sender_postal_code && (
                  <span>{`${v.sender_postal_code},`}</span>
                )}
                {v.sender_province && <span>{`${v.sender_province},`}</span>}
                {v.sender_country && <span>{`${v.sender_country}`}</span>}
              </span>
            </p>
            <Divider className='bg-[#D3D3D3]' />
            <p className='text-[12px] leading-[15px] text-[#6F6D6D]'>Gửi đến</p>

            <p className='grid text-[12px] leading-[15px] text-[#1f1f1f]'>
              <span> {v.receiver_name}</span>
              <span> {v.receiver_contact_person}</span>
              <span> {v.receiver_phone_number}</span>
              <span>
                {v.receiver_postal_code && (
                  <span>{`${v.receiver_postal_code},`}</span>
                )}
                {v.receiver_province && (
                  <span>{`${v.receiver_province},`}</span>
                )}
                {v.receiver_country && <span>{`${v.receiver_country}`}</span>}
              </span>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TableView;
