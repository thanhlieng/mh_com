/* eslint-disable no-prototype-builtins */
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import * as _ from 'lodash';


/* eslint-disable @typescript-eslint/no-explicit-any */
export const renderColumnHistory = () => {
  const columns: ColumnsType<any> = [
    {
      title: 'Id Log',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      width: '5%',
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedUser',
      key: 'updatedUser',
      align: 'center',
      width: '10%',
      render: (record) => record.username
    },
    {
      title: 'Pages',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: '12%',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: '5%',
      render: (record) => record?.toUpperCase()
    },
    {
      title: 'Table',
      dataIndex: 'targetTable',
      key: 'targetTable',
      align: 'center',
      width: '10%',
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      align: 'center',
      width: '15%',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      align: 'center',
      width: '10%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: '10%',
      render: (record) => dayjs(record).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Old Item',
      dataIndex: 'oldItem',
      key: 'oldItem',
      align: 'left',
      width: '40%',
      render: (record, data) => checkDiff(record, data.newItem),
    },
    {
      title: 'New Item',
      dataIndex: 'newItem',
      key: 'newItem',
      align: 'left',
      width: '40%',
      render: (record, data) => checkDiff(record, data.oldItem),
    },

  ];
  return columns;
};

const checkDiff = (obj1: any, obj2: any) => {
  if (!obj1) return JSON.stringify({});
  const keys: any = _.union(_.keys(obj1), _.keys(obj2));

  const diff = keys.reduce((result: any, key: any) => {
    if (!_.isEqual(obj1?.[key], obj2?.[key])) {
      if (obj1?.hasOwnProperty(key)) result.obj1[key] = obj1[key];
      if (obj2?.hasOwnProperty(key)) result.obj2[key] = obj2[key];
    }
    return result;
  }, { obj1: {}, obj2: {} });

  const a = diff.obj1 ? JSON.stringify(diff.obj1) : '';
  return a;
}
