/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, Form, FormInstance, Row, Select } from 'antd';
import React, { useEffect } from 'react';

import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';

import { OpitionType } from '@/contants/types';
import { BookingDetailPU } from '@/utils/contants/services';
interface CheckPointProps {
  form: FormInstance;
  opition: Array<OpitionType>;
  bookingType: Array<OpitionType>;
  dataPackageDetail: Array<BookingDetailPU>;
}

const { Option } = Select;
const CheckPoint = ({
  form,
  opition,
  bookingType,
  dataPackageDetail,
}: CheckPointProps) => {
  const [totalPackage, setTotalPackage] = React.useState(0);
  const [totalWeight, setTotalWeight] = React.useState(0);
  const [totalBulkyWeight, setTotalBulkyWeight] = React.useState(0);

  useEffect(() => {
    const packageSum = dataPackageDetail.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const weightSum = dataPackageDetail.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );
    const bulkyWeightSum = dataPackageDetail.reduce(
      (sum, item) => sum + item.bulkyWeight * item.quantity,
      0
    );

    setTotalPackage(packageSum);
    setTotalWeight(weightSum);
    setTotalBulkyWeight(bulkyWeightSum);
  }, [dataPackageDetail]);

  return (
    <Form form={form}>
      <Form.Item name='booking_code'>
        <VInput label='Mã Bill' disabled isHorizal />
      </Form.Item>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Form.Item name='customer_code'>
            <VInput label='Mã Khách hàng' disabled isHorizal />
          </Form.Item>
        </Col>
        <Col xs={24} lg={12}>
          <Form.Item name='customer_full_name'>
            <VInput label='Tên khách hàng' disabled isHorizal />
          </Form.Item>
        </Col>
        <Col xs={24} lg={6}>
          <Form.Item name='booking_type'>
            <VSelect label='Loại hàng hóa' isHorizal>
              {bookingType?.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Form.Item
            name='require_partner_service_id'
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập dịch vụ đối tác',
              },
            ]}
          >
            <VSelect
              label='Dịch vụ đối tác yêu cầu'
              isHorizal
              required
              showSearch
            >
              {opition?.map((v) => (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              ))}
            </VSelect>
          </Form.Item>
        </Col>
        <Col xs={24} lg={6}>
          <Form.Item>
            <VInput
              label='Tổng số kiện'
              value={totalPackage}
              isHorizal
              disabled
            />
          </Form.Item>
        </Col>
        <Col xs={24} lg={6}>
          <Form.Item>
            <VInput
              label='Tổng TL thực'
              value={totalWeight.toFixed(2)}
              disabled
              isHorizal
            />
          </Form.Item>
        </Col>
        <Col xs={24} lg={6}>
          <Form.Item>
            <VInput
              label='Tổng TL cồng kềnh'
              value={totalBulkyWeight.toFixed(2)}
              isHorizal
              disabled
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={24}>
          <Form.Item name='content_detail'>
            <VInput label='Nội dung chi tiết bưu phẩm bưu kiện' isHorizal />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Form.Item name='booking_customs_declaration_number'>
            <VInput label='Tờ khai hải quan' isHorizal />
          </Form.Item>
        </Col>
        <Col xs={24} lg={18}>
          <Form.Item name='booking_note'>
            <VInput label='Ghi chú' isHorizal />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default CheckPoint;
