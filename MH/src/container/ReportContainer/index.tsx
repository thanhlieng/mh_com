/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  DatePicker,
  Input,
  notification,
  Select,
  Spin,
  Table,
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import FileUpload from '@/components/FileUpLoad';

import {
  BASE_URL,
  QUERY_PARAMS,
  QueryParams,
} from '@/contants/common.constants';
import { ACCSESS_TOKEN } from '@/contants/Storage';
import useGetPermission from '@/hook/getPermission';
import { getListEmployeeAssign, getReport } from '@/services/assign.services';

import ItemControlTableRender from '@/components/TableCustom';
import { generateDowloadList } from '@/services/booking.services';
import { formatNumberWithCommas } from '@/utils/ultils';
import { DownloadOutlined } from '@ant-design/icons';
import { GET_LIST } from '../ListContainer';
import { REPORT_COLUMNS } from './columns';
import Image from 'next/image';
import { debounce } from 'lodash';

const { Option } = Select;
const { RangePicker } = DatePicker;

const select = [
  {
    keyMap: 'reportForEmployee',
    label: 'BC chi tiết DT theo nhân viên',
    permission: 'statistical_by_staff',
  },
];

const ReportContainer = () => {
  const { permissions } = useGetPermission();
  const [fileList, setFileList] = useState<any | null>(null);

  const [fwd, setFWD] = useState<any | null>(null);

  const [fwdLoading, setFWDLoading] = useState<boolean>(false);
  const [cpnLoading, setCPNLoading] = useState<boolean>(false);

  const [queriesGet, setQueriesGet] = useState<{
    staffId?: string;
    from?: string | Date;
    to?: string | Date;
    page: number;
    pageSize: number;
    search: string;
  }>({
    page: 1,
    pageSize: 20,
    search: '',
  });
  const [queries, setQueries] = useState<QueryParams>({
    page: 1,
    pageSize: 100,
    search: '',
  });

  const { data: dataListUser, isLoading: listUserLoading } = useQuery(
    [GET_LIST, queries],
    () => getListEmployeeAssign(queries)
  );
  const { data, isLoading } = useQuery([queriesGet], () =>
    getReport(queriesGet)
  );
  const handleImportCpn = async (data: any) => {
    const accessToken = localStorage.getItem(ACCSESS_TOKEN);
    const configHeader = { Authorization: `Bearer ${accessToken}` };
    setCPNLoading(true);
    if (data.length > 0) {
      const files = data ? [...data] : [];
      const dataUpload = new FormData();
      files.forEach((file, i) => {
        dataUpload.append(`file`, file, file.name);
      });
      axios({
        method: 'POST',
        url: `${BASE_URL}/finance-statistical/cpn
        `,
        data: dataUpload,
        headers: configHeader,
      })
        .then((res) => {
          if (res.status === 201) {
            notification.success({
              message: 'Import dữ liệu thành công',
              placement: 'top',
            });
          }
        })
        .catch((e) =>
          notification.error({
            message: `${
              e.response ? e.response.data.message : 'import dữ liệu thất bại'
            }`,
            placement: 'top',
          })
        )
        .finally(() => setCPNLoading(false));
    }
  };

  const optionUser = useMemo(() => {
    if (!dataListUser) {
      return [];
    }
    return dataListUser?.map((v: any) => {
      return {
        value: v?.id,
        label: `${v?.staffCode} - ${v?.fullName}`,
      };
    });
  }, [dataListUser]);

  const queryClient = useQueryClient();
  const { mutate: getDowloadList } = useMutation(generateDowloadList, {
    onSuccess: () => {
      queryClient.invalidateQueries([]);
      notification.success({
        message: 'Tải xuống thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Tải xuống thất bại',
        placement: 'top',
      });
    },
  });

  const exportStatisticalByStaffFile = () => {
    getDowloadList({
      endpoint: 'finance-statistical/export-statistical-staff-file',
      params: queriesGet,
    });
  };

  const handleImportFWD = async (data: any) => {
    const accessToken = localStorage.getItem(ACCSESS_TOKEN);
    const configHeader = { Authorization: `Bearer ${accessToken}` };
    setFWDLoading(true);
    if (data.length > 0) {
      const files = data ? [...data] : [];
      const dataUpload = new FormData();
      files.forEach((file, i) => {
        dataUpload.append(`file`, file, file.name);
      });
      axios({
        method: 'POST',
        url: `${BASE_URL}/finance-statistical/fwd
        `,
        data: dataUpload,
        headers: configHeader,
      })
        .then((res) => {
          if (res.status === 201) {
            notification.success({
              message: 'Import dữ liệu thành công',
              placement: 'top',
            });
          }
        })
        .catch((e) =>
          notification.error({
            message: `${
              e.response ? e.response.data.message : 'import dữ liệu thất bại'
            }`,
            placement: 'top',
          })
        )
        .finally(() => setFWDLoading(false));
    }
  };

  const handleChangeDateFilter = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      from: moment(value?.[0]).format('YYYY-MM-DD'),
      to: moment(value?.[1]).format('YYYY-MM-DD'),
    }));
  };
  const handleChangeStaff = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      staffId: value,
    }));
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueriesGet((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };

  const handleSearch = debounce((value: string) => {
    const searchValue = value.toLowerCase().trim();
    setQueriesGet((prev) => ({
      ...prev,
      search: searchValue,
    }));
  }, 500);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-row flex-wrap gap-4'>
        <Input
          placeholder='Tìm kiếm'
          suffix={
            <Image
              src='/images/search-icon.svg'
              className='cursor-pointer'
              width={20}
              height={20}
              alt='search'
            />
          }
          className='w-[350px]'
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleSearch(event.target.value)
          }
        />
        <Select className='w-[250px]' placeholder='Loại báo cáo'>
          {select
            .filter((v) => permissions?.includes(v.permission))
            .map(({ label, keyMap }) => (
              <Option value={keyMap} key={keyMap}>
                {label}
              </Option>
            ))}
        </Select>

        <Select
          placeholder='Chọn nhân viên'
          className='w-[250px]'
          onChange={handleChangeStaff}
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          showArrow
          showSearch
          allowClear
        >
          {optionUser.map((v) => (
            <Option key={v.value} value={v.value}>
              {v.label}
            </Option>
          ))}
        </Select>

        <RangePicker
          format='DD-MM-YYYY'
          onChange={handleChangeDateFilter}
          className='h-8 w-[300px]'
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          defaultValue={[moment().startOf('month'), moment().endOf('month')]}
        />
      </div>
      <div className='flex flex-row gap-4'>
        {permissions?.includes('import_statistical_file') && (
          <div className='flex flex-row gap-4'>
            <Spin spinning={cpnLoading}>
              <FileUpload
                handleSetFileList={handleImportCpn}
                fileList={fileList}
                label='Import CPN'
              />
            </Spin>
            <Spin spinning={fwdLoading}>
              <FileUpload
                handleSetFileList={handleImportFWD}
                fileList={fwd}
                label='Import FWD'
                isDisable={true}
              />
            </Spin>
          </div>
        )}
        {(permissions?.includes('statistical_by_staff') ||
          permissions?.includes('report_for_accounting')) && (
          <Spin spinning={fwdLoading}>
            <Button
              type='primary'
              onClick={exportStatisticalByStaffFile}
              icon={<DownloadOutlined />}
            >
              Xuất báo cáo
            </Button>
          </Spin>
        )}
      </div>

      <div>
        <Table
          rowKey={(row) => row.booking_code}
          columns={REPORT_COLUMNS}
          dataSource={data?.data ? data.data : []}
          onChange={handlePagination}
          pagination={{
            current: data?.pagination?.currentPage,
            total: data?.pagination?.totalCount,
            pageSize: data?.pagination?.pageSize,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          loading={isLoading}
          scroll={{ y: 600, x: 600 }}
          // summary={(pageData) => {
          //   return (
          //     <Table.Summary.Row>
          //       <Table.Summary.Cell
          //         className='text-center'
          //         index={0}
          //         colSpan={2}
          //       >
          //         Tổng
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={2} />
          //       <Table.Summary.Cell className='text-center' index={3} />
          //       <Table.Summary.Cell className='text-center' index={4} />
          //       <Table.Summary.Cell className='text-center' index={5} />
          //       <Table.Summary.Cell className='text-center' index={6} />
          //       <Table.Summary.Cell className='text-center' index={7} />
          //       <Table.Summary.Cell className='text-center' index={8} />
          //       <Table.Summary.Cell className='text-center' index={9} />
          //       <Table.Summary.Cell className='text-center' index={10} />
          //       <Table.Summary.Cell className='text-center' index={11}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_billable_weight ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={12}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_pp1_price ?? 0.0).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={13}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_gvg_pp1_price ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={14}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_pp2_price ?? 0.0).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={15}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_gvg_pp2_price ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={16}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_pp3_price ?? 0.0).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={17}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_gvg_pp3_price ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={18}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_extend_pp_1 ?? 0.0).toFixed(
          //             2
          //           )
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={19}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_extend_gvg_pp_1 ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={20}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_extend_pp_2 ?? 0.0).toFixed(
          //             2
          //           )
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={21}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_extend_gvg_pp_2 ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={22}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_extend_pp_3 ?? 0.0).toFixed(
          //             2
          //           )
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={23}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_extend_gvg_pp_3 ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={24}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_extend_pp_4 ?? 0.0).toFixed(
          //             2
          //           )
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={25}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_extend_gvg_pp_4 ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={26}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_extend_pp_5 ?? 0.0).toFixed(
          //             2
          //           )
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={27}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_extend_gvg_pp_5 ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={28}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_sales_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={29}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_shareholder_equity_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={30}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_lkd_sales_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={31}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_pp_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={32}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_gv_total_pp_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={33}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_sales_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={34}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_gv_total_sales_price_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={35}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_ppxd_vnd ?? 0.0).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={36}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_gv_ppxd_vnd ?? 0.0).toFixed(
          //             2
          //           )
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={37}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_extend_pp_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={38}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_extend_gv_pp_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={39}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_sales_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={40}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_origin_gv_acf_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={41}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_origin_sales_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={42}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_ros ?? 0.0).toFixed(2)
          //         )}
          //         %
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={43}>
          //         {formatNumberWithCommas(
          //           parseFloat(data?.sumValues?.sum_vat_vnd ?? 0.0).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={44}>
          //         {formatNumberWithCommas(
          //           parseFloat(
          //             data?.sumValues?.sum_total_sales_vat_vnd ?? 0.0
          //           ).toFixed(2)
          //         )}
          //       </Table.Summary.Cell>
          //       <Table.Summary.Cell className='text-center' index={45} />
          //       <Table.Summary.Cell className='text-center' index={46} />
          //     </Table.Summary.Row>
          //   );
          // }}
        />
      </div>
    </div>
  );
};

export default ReportContainer;
