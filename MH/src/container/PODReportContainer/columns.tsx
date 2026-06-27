/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { ColumnsType } from 'antd/lib/table';

export const POD_REPORT_COLUMNS: ColumnsType<any> = [
  {
    title: 'STT',
    key: 'no',
    align: 'center',
    width: 40,
    fixed: true,
    render: (_text, _object, index) => {
      return <span className='text-center'>{index + 1}</span>;
    },
  },
  {
    title: 'Ngày xuất ra khỏi công ty',
    dataIndex: 'dateOut',
    align: 'center',
    width: 140,
    fixed: true,
  },
  {
    title: 'Tổng số bưu xuất',
    dataIndex: 'total',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tổng số bưu đã phát thành công',
    dataIndex: 'totalDeliveried',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát thành công',
    dataIndex: 'percentDeliveried',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tổng số bưu chưa phát',
    dataIndex: 'totalDeliveried',
    align: 'center',
    width: 140,
    render: (_text, _object, index) => {
      return (
        <span className='text-center'>
          {_object.total - _object.totalDeliveried}
        </span>
      );
    },
  },
  {
    title: 'Tỷ lệ đơn chưa phát',
    dataIndex: 'percentDeliveried',
    align: 'center',
    width: 140,
    render: (_text, _object, index) => {
      return (
        <span className='text-center'>
          {(
            ((_object.total - _object.totalDeliveried) * 100) /
            _object.total
          ).toFixed(2)}
          %
        </span>
      );
    },
  },
  {
    title: 'Số bưu phát ngày 1',
    dataIndex: 'totalDeliveried1',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 1',
    dataIndex: 'percentDeliveried1',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 2',
    dataIndex: 'totalDeliveried2',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 2',
    dataIndex: 'percentDeliveried2',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 3',
    dataIndex: 'totalDeliveried3',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 3',
    dataIndex: 'percentDeliveried3',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 4',
    dataIndex: 'totalDeliveried4',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 4',
    dataIndex: 'percentDeliveried4',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 5',
    dataIndex: 'totalDeliveried5',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 5',
    dataIndex: 'percentDeliveried5',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 6',
    dataIndex: 'totalDeliveried6',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 6',
    dataIndex: 'percentDeliveried6',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 7',
    dataIndex: 'totalDeliveried7',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 7',
    dataIndex: 'percentDeliveried7',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 8',
    dataIndex: 'totalDeliveried8',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 8',
    dataIndex: 'percentDeliveried8',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 9',
    dataIndex: 'totalDeliveried9',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 9',
    dataIndex: 'percentDeliveried9',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát ngày 10',
    dataIndex: 'totalDeliveried10',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát Ngày 10',
    dataIndex: 'percentDeliveried10',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số bưu phát trên 10 ngày',
    dataIndex: 'totalDeliveriedPlus',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tỷ lệ phát trên 10 ngày',
    dataIndex: 'percentDeliveriedPlus',
    align: 'center',
    width: 140,
  },
];
