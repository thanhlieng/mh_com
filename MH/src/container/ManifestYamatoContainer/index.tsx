/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Spin,
  Table,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import axios from 'axios';
import { debounce } from 'lodash';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import FileUpload from '@/components/FileUpLoad';
import ExcelIcon from '@/components/Icon/ExcelIcon';
import ItemControlTableRender from '@/components/TableCustom';

import { manifestColumns } from '@/contants/columns/manifest-yamato-columns';
import { BASE_URL, QUERY_PARAMS } from '@/contants/common.constants';
import { ACCSESS_TOKEN } from '@/contants/Storage';
import { countries } from '@/contants/types/Country';
import { QueriesParamsManifest } from '@/services/list.services';
import {
  exportAllBill,
  exportAllInvoice,
  exportExcelManifest,
  getListYamatoServices,
  getPartnerServicesManifest,
  updateListYamatoServices,
  updateTeamplateServices,
} from '@/services/manifest.yamato.services';

import {
  generateBillPatner,
  generatePartnerInvoiceAdmin,
} from '@/services/booking.services';
import ManifestYamatoModal from './Modal/ManifestYamato';

const EditableContext = React.createContext(null);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//  @ts-ignore
const EditableRow = ({ _, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore  */}
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  editable,
  children,
  dataIndex,
  record,
  keyInput,
  handleSave,
  ...restProps
}: any) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = async () => {
    setEditing(!editing);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      const values = await form.validateFields();

      toggleEdit();

      const payload =
        Object.keys(values)[0] === 'items'
          ? {
              ...record,
              items: record.items?.map((item: any) => {
                item[`${keyInput}`] = Object.values(values)[0];
                return item;
              }),
            }
          : { ...record, ...values };

      handleSave(payload);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      form.resetFields();
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log(errInfo);
      notification.error({
        message: 'Có lỗi vui lòng thử lại sau',
        placement: 'top',
      });
    }
  };

  let childNode = children;
  const dataString = [
    'packageID',
    'referenceNoManifest',
    'itemNameManifest',
    'consigneeNameJapaneseManifest',
    'consigneeCodeManifest',
    'registeredCompanyNameManifest',
    'addressManifest',
    'trackingNo',
    'invoiceCurManifest',
    'uomManifest',
    'originOfCountry',
    'shipmentType',
  ];
  if (editable) {
    childNode = editing ? (
      dataString.includes(dataIndex) ? (
        dataIndex === 'originOfCountry' ? (
          <Form.Item
            name={dataIndex}
            rules={[{ required: true, message: 'Vui lòng chọn quốc gia' }]}
          >
            <Select
              showSearch
              ref={inputRef}
              onBlur={save}
              filterOption={(input, option) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {countries.map((v) => (
                <Select.Option value={v.value} key={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item className='m-0 p-1' name={dataIndex}>
            <Input
              ref={inputRef}
              onPressEnter={save}
              onBlur={save}
              className='rounded-[10px]'
            />
          </Form.Item>
        )
      ) : (
        <Form.Item className='m-0 p-1' name={dataIndex}>
          <InputNumber
            className='w-full rounded-[10px]'
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        </Form.Item>
      )
    ) : (
      <div className='editable-cell-value-wrap' onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const ManifestYamatoContainer = () => {
  const [queries, setQueries] = useState<QueriesParamsManifest>({
    page: 1,
    pageSize: 10,
  });

  const [idRow, setIdRow] = useState();
  const [formPackageID] = useForm();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalManifest, setOpenModalManifest] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(['GET_DATA', queries], () =>
    getListYamatoServices(queries)
  );
  const { data: manifestOptions } = useQuery(['fetchManifestOptions', {}], () =>
    getPartnerServicesManifest()
  );

  const [form] = useForm();
  const [fileList, setFileList] = useState<any | null>(null);
  const { mutate: updateYamato } = useMutation(updateListYamatoServices, {
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_DATA']);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const partnerServiceManifestOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (manifestOptions?.length < 0) {
      return [];
    } else {
      return manifestOptions?.map((v) => ({
        value: v.key,
        label: v.name,
      }));
    }
  }, [manifestOptions]);

  const { mutate: updateTeamplate } = useMutation(updateTeamplateServices, {
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_DATA']);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
      formPackageID.resetFields();
      setOpenModal(false);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: generateExcel, isLoading: generateExcelLoading } =
    useMutation(exportExcelManifest, {
      onSuccess: () => {
        queryClient.invalidateQueries(['GET_DATA']);
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
  const { mutate: generateAllBill, isLoading: allBillLoading } = useMutation(
    exportAllBill,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['GET_DATA']);
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
    }
  );
  const { mutate: generateAllInvoice, isLoading: allInvoiceLoading } =
    useMutation(exportAllInvoice, {
      onSuccess: () => {
        queryClient.invalidateQueries(['GET_DATA']);
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

  const { mutate: genBillPatner } = useMutation(generateBillPatner, {
    onSuccess: () => {
      queryClient.invalidateQueries(['generateBillPartner']);
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

  const { mutate: generatorInvoice } = useMutation(
    generatePartnerInvoiceAdmin,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['generateInVoice']);
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
    }
  );

  const handleSearch = debounce((value: string) => {
    setQueries((prev) => ({ ...prev, search: value }));
  }, 500);

  const handleChangePartnerService = (value: string) => {
    setQueries((prev) => ({ ...prev, permissionActionKey: value }));
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleShowPopup = (value: any) => {
    if (value.id) {
      setIdRow(value.id);
      setOpenModalManifest(true);
    }
  };
  const handleSave = (row: any) => {
    const {
      packageID,
      referenceNoManifest,
      consigneeCodeManifest,
      registeredCompanyNameManifest,
      addressManifest,
      gwManifest,
      freightChargeManifest,
      itemNameManifest,
      lengthManifest,
      widthManifest,
      heightManifest,
      consigneeNameJapaneseManifest,
      qtyManifest,
      uomManifest,
      unitPriceManifest,
      invoiceCurManifest,
      paymentTermManifest,
      trackingNo,
      originOfCountry,
      shipmentType,
    } = row;
    const params = {
      packageID,
      referenceNoManifest,
      gwManifest,
      freightChargeManifest,
      itemNameManifest,
      lengthManifest,
      widthManifest,
      heightManifest,
      consigneeNameJapaneseManifest,
      consigneeCodeManifest,
      registeredCompanyNameManifest,
      addressManifest,
      qtyManifest,
      uomManifest,
      unitPriceManifest,
      invoiceCurManifest,
      paymentTermManifest,
      trackingNo,
      originOfCountry,
      shipmentType,
    };

    if (row.id) {
      updateYamato({ id: row.id, data: params });
    }
  };

  const handleUploadInvoiceFile = async (row: any, data: any) => {
    try {
      const accessToken = localStorage.getItem(ACCSESS_TOKEN);
      const configHeader = { Authorization: `Bearer ${accessToken}` };
      if (data.length > 0) {
        const files = data ? [...data] : [];
        const dataUpload = new FormData();
        files.forEach((file, i) => {
          dataUpload.append(`file`, file, file.name);
        });
        const upload: any = await axios({
          method: 'POST',
          headers: configHeader,
          url: `${BASE_URL}/booking/admin/upload-partner-invoice/${row.id}`,
          data: dataUpload,
        });
        if (upload.status === 201) {
          queryClient.invalidateQueries(['GET_DATA']);
          notification.success({
            message: 'Upload file thành công',
            placement: 'top',
          });
        }
      }
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message || 'Upload file thất bại',
        placement: 'top',
      });
    }
  };

  const handleGeneratePartnerBill = (bookingID: string) => {
    if (bookingID) {
      genBillPatner(bookingID);
    }
  };

  const handleGenerateInvoice = (bookingID: string) => {
    if (bookingID) {
      generatorInvoice(bookingID);
    }
  };

  const columns = manifestColumns(data?.pagination?.currentPage || 0, {
    handleClick: handleShowPopup,
    handleUploadFile: handleUploadInvoiceFile,
    handleGeneratePartnerBill,
    handleGenerateInvoice,
  }).map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        };
      },
    };
  });

  const handleGenerateExcel = () => {
    generateExcel({
      permissionActionKey: queries.permissionActionKey,
    });
  };
  const handleAllBill = () => {
    generateAllBill({
      permissionActionKey: queries.permissionActionKey,
    });
  };
  const handleAllInvoice = () => {
    generateAllInvoice({
      permissionActionKey: queries.permissionActionKey,
    });
  };
  const onOpenModalPakageID = () => {
    setOpenModal(true);
  };

  const onFinish = async () => {
    const res = await formPackageID.validateFields();
    updateTeamplate({ data: { ...res } });
    // Mapping data sua API updateTeamplate
  };

  const handleSetFileList = async (data: any) => {
    try {
      const accessToken = localStorage.getItem(ACCSESS_TOKEN);
      const configHeader = { Authorization: `Bearer ${accessToken}` };
      if (data.length > 0) {
        const files = data ? [...data] : [];
        const dataUpload = new FormData();
        files.forEach((file, i) => {
          dataUpload.append(`file`, file, file.name);
        });
        const upload: any = await axios({
          method: 'POST',
          headers: configHeader,
          url: `${BASE_URL}/booking/admin/upload-manifest-yamato`,
          data: dataUpload,
        });
        if (upload.status === 201) {
          queryClient.invalidateQueries(['GET_DATA']);

          notification.success({
            message: 'Upload file thành công',
            placement: 'top',
          });
        }
      }
    } catch (error: any) {
      notification.success({
        message: error?.response?.data?.message || 'Upload file thất bại',
        placement: 'top',
      });
    }
  };
  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };
  return (
    <Spin className='mt-[50px] flex flex-col gap-[10px]' spinning={isLoading}>
      <div className='mb-4 flex flex-row flex-wrap gap-4'>
        <Input
          placeholder='Tìm kiếm'
          onChange={(e) => handleSearch(e.target.value)}
          className='w-72'
        />
        <Select
          showSearch
          className='w-[200px]'
          onChange={(e) => handleChangePartnerService(e)}
        >
          {partnerServiceManifestOptions?.map((v) => (
            <Select.Option value={v.value} key={v.value}>
              {v.label}
            </Select.Option>
          ))}
        </Select>
        <div
          className=' flex h-[32px] w-[150px] cursor-pointer flex-row items-center justify-center gap-2 rounded-md border-[1px] p-2'
          onClick={() => {
            !generateExcelLoading && handleGenerateExcel();
          }}
        >
          <ExcelIcon width={22} height={22} />
          <span>Xuất excel</span>
        </div>

        <div
          className='h-[32px] w-[150px] cursor-pointer rounded-md border-[1px] '
          onClick={handleAllBill}
        >
          <Spin spinning={allBillLoading}>
            <div className='flex h-[32px] flex-row items-center justify-center gap-2'>
              <ExcelIcon width={22} height={22} />
              <span>Xuất all bill</span>
            </div>
          </Spin>
        </div>
        <div
          className='h-[32px] w-[150px] cursor-pointer rounded-md border-[1px] '
          onClick={handleAllInvoice}
        >
          <Spin spinning={allInvoiceLoading}>
            <div className='flex h-[32px] flex-row items-center justify-center gap-2'>
              <ExcelIcon width={22} height={22} />
              <span>Xuất all Invoice</span>
            </div>
          </Spin>
        </div>
        <div>
          <Button onClick={onOpenModalPakageID}>
            Tạo template cho Package ID
          </Button>
        </div>
        <div>
          <FileUpload
            handleSetFileList={handleSetFileList}
            fileList={fileList}
            label='Upload Manifest'
          />
        </div>
      </div>
      <Table
        components={components}
        dataSource={data?.data}
        columns={columns}
        rowKey={(e) => e.id}
        bordered
        onChange={handlePagination}
        scroll={{ y: 600, x: 600 }}
        rowClassName={() => 'editable-row'}
        pagination={{
          current: data?.pagination?.currentPage,
          total: data?.pagination?.totalCount,
          showSizeChanger: false,
          defaultPageSize: QUERY_PARAMS.pageSize,
          itemRender: ItemControlTableRender,
        }}
      />
      <Modal
        footer={null}
        open={openModal}
        title={
          <HeaderModal
            title='Tạo teample Package ID'
            onClose={() => setOpenModal(false)}
          />
        }
        destroyOnClose
        closeIcon={false}
        closable={false}
        onCancel={() => setOpenModal(false)}
        className='top-[20px] w-[calc(50vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
      >
        <div>
          <Form form={formPackageID} onFinish={onFinish}>
            <Form.Item
              name='packageID'
              rules={[{ required: true, message: 'Vui lòng không để trống' }]}
            >
              <VInput
                label='Nhập template cho PackageId '
                isHorizal
                placeholder='Nhập template Package ID bạn muốn '
              />
            </Form.Item>
          </Form>
          <div className='mt-10 flex flex-row gap-4'>
            <Button danger onClick={() => setOpenModal(false)}>
              Hủy
            </Button>
            <Button type='primary' htmlType='submit' onClick={onFinish}>
              Đồng ý
            </Button>
          </div>
        </div>
      </Modal>

      <ManifestYamatoModal
        idRow={idRow}
        onSubmit={handleSave}
        openModal={openModalManifest}
        setOpenModal={setOpenModalManifest}
      />
    </Spin>
  );
};

export default ManifestYamatoContainer;
