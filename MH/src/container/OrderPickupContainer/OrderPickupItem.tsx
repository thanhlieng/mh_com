/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, Row } from 'antd';
import moment from 'moment';

const OrderPickupItem = ({ data }: any) => {
  return (
    <Row gutter={[4, 4]}>
      <Col xs={6}>Mã Bill</Col>
      <Col xs={18}>{data?.booking_code}</Col>
      <Col xs={6}>Điện thoại </Col>
      <Col xs={18}>{data?.sender_phone_number}</Col>
      <Col xs={6}>Thời gian </Col>
      <Col xs={18}>
        {moment(data?.estimate_date).format('DD/MM/YYYY HH:mm:ss')}
      </Col>
      <Col xs={6}>Mã khách hàng </Col>
      <Col xs={18}>{data?.customer_code}</Col>
      <Col xs={6}>Cân nặng </Col>
      <Col xs={18}>{data?.weight}</Col>

      <Col xs={6}>Cân nặng cồng kềnh </Col>
      <Col xs={18}>{data?.bulky_weight}</Col>
      <Col xs={6}>Số lượng </Col>
      <Col xs={18}>{data?.quantity}</Col>
      <Col xs={6}>Thông tin người gửi </Col>
      <Col xs={18}>{data?.sender_name}</Col>
    </Row>
  );
};
export default OrderPickupItem;
