/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { WarningOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Modal,
  notification,
  Row,
  Spin,
  Table,
} from 'antd';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ItemControlTableRender from '@/components/TableCustom';

import { BookingType, OpitionType } from '@/contants/types';
import {
  calculateBulkyWeight,
  fetchServicePartnerService,
  fetchServicesBooking,
} from '@/services/booking.services';

import { rendeColumsPickup } from '../../../../utils/contants/columns.contants';
import { QUERY_KEY } from '../../../../utils/contants/query-key';
import {
  BookingDetailPU,
  getDelivery,
  getPU,
  getPUId,
  patchPUForwardOP,
  pathPU,
  postPu,
  QUERY,
} from '../../../../utils/contants/services';
import CheckPoint from './Checkpoint';
import InfoCheckpoint from './InfoCheckPoint';
import ModalCreatInfo from './InfoCheckPoint/ModalInfo/ModalCreate';

const QUERY_PARAMS: QUERY = {
  page: 1,
  pageSize: 20,
  search: '',
  orderBy: 'createdAt_DESC',
};
const PickUpContainer = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [search, setSearch] = useState<any>();

  const [infoForm] = Form.useForm();
  const [infoCheckPoint, setInfoCheckPoint] = useState<Array<BookingDetailPU>>(
    []
  );

  const [queries, setQueries] = useState<QUERY>(QUERY_PARAMS);

  const [id, setId] = useState<any>();
  const [bookingId, setBookingId] = useState<any>();

  const [open, setOpen] = useState<boolean>(false);
  const [idRowClick, setIdRowClick] = useState();
  const [status, setStatus] = useState<number>();
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [idKey, setIdKey] = useState();
  const [servicesId, setServicesId] = useState();
  const queryClient = useQueryClient();

  const bookingType = Object.entries(BookingType).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const {
    data: dataPU,
    isLoading: loadingPu,
    isFetching: fetchingPU,
  } = useQuery([QUERY_KEY.GET_DATA, queries], () => getPU(queries));

  const { data: dataSerivicesBooknig } = useQuery(
    [QUERY_KEY.GET_PU, queries],
    () => fetchServicesBooking()
  );

  const { data: dataPartnersService } = useQuery(
    [[QUERY_KEY.GET_PU, queries]],
    () => fetchServicePartnerService()
  );

  const OpitionServiceBooking = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataSerivicesBooknig?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataSerivicesBooknig?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataSerivicesBooknig]);

  const OpitionPartnerService = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataPartnersService?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataPartnersService?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataPartnersService]);

  const { data, isLoading, isFetching } = useQuery(
    [QUERY_KEY.GET_DATA, { search }],
    () => getDelivery(search)
  );

  const { isLoading: loadingPuById, isFetching: fetchingPuById } = useQuery(
    [QUERY_KEY.GET_DATA, idRowClick],
    () => getPUId({ id: idRowClick, handleCallBack: handleCallBackGet })
  );

  const { mutate: updatePu } = useMutation(pathPU, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY.GET_DATA]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Cập nhật thất bại',
        placement: 'top',
      });
    },
  });

  const { mutate: PUForwardBillToOP } = useMutation(patchPUForwardOP, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY.GET_DATA]);
      notification.success({
        message: 'Chuyển toàn bộ bill sang bộ phận OP thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Cập nhật thất bại',
        placement: 'top',
      });
    },
  });

  const { mutate: addPu } = useMutation(postPu, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY.GET_DATA]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Cập nhật thất bại',
        placement: 'top',
      });
    },
  });

  const handleSetStatus = (status: any) => {
    setStatus(status);
  };

  const handleClearData = () => {
    form.resetFields();
    infoForm.resetFields();
    setInfoCheckPoint([]);
    setId(null);
    setBookingId(null);
  };

  const options = useMemo(() => {
    if (isLoading || isFetching || !data) {
      return [];
    } else {
      return data?.map((values) => ({
        ...values,
        value: values.booking_code,
      }));
    }
  }, [data, isFetching, isLoading]);

  const handleSearch = debounce((value?: string) => {
    setSearch(value);
    handleClearData();
  }, 500);

  const handleSelect = debounce((e: any) => {
    const value = options.find((f) => f.booking_code === e);
    const bookingServicesId = OpitionServiceBooking?.find(
      (x: OpitionType) => x.value === value?.booking_service_booking
    );
    form.setFieldsValue({
      ...value,
      booking_type: bookingType?.find((x) => x.value === value?.booking_type),
      booking_service_booking: bookingServicesId,
    });
    setServicesId(bookingServicesId?.value);
    setInfoCheckPoint(value?.booking_detail || []);
    setBookingId(value?.booking_id);
    setId(value?.pu_delivery_id);
    setStatus(value?.status || 0);
  }, 500);

  const handleDelete = (id: any) => {
    const res = infoCheckPoint.filter((x, index) => id !== index);
    setInfoCheckPoint(res);
  };

  const handleCallBackGet = (data: any) => {
    form.setFieldsValue({
      ...data,
      booking_type: bookingType?.find((x) => x.value === data?.type),
      booking_service_booking: data?.service_booking_id,
      booking_customs_declaration_number: data?.customs_declaration_number,
      booking_note: data?.note,
    });
    setStatus(data?.status || 0);
    setInfoCheckPoint(
      data?.details?.map((v: any) => ({
        ...v,
        bulky_weight: v.bulkyWeight,
      })) || []
    );
    setBookingId(data?.id);
    setServicesId(data?.service_booking_id);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleOK = async () => {
    if (bookingId) {
      const res = await form.validateFields();
      const customData = {
        details: infoCheckPoint.map(
          ({ quantity, weight, bulkyWeight, height, width, longs }) => {
            return {
              bulkyWeight: parseFloat(bulkyWeight?.toString()),
              quantity: parseFloat(quantity?.toString()),
              weight: parseFloat(weight?.toString()),
              height: parseFloat(height?.toString()),
              width: parseFloat(width?.toString()),
              longs: parseFloat(longs?.toString()),
            };
          }
        ),
        type: res.booking_type?.value || res.booking_type,
        quantity: res.quantity,
        requirePartnerServiceId:
          res.require_partner_service_id?.value ||
          res.require_partner_service_id,
        serviceBookingId: servicesId,
        contentDetail: res.content_detail,
        customsDeclarationNumber: res.booking_customs_declaration_number,
        note: res.booking_note,
      };
      addPu({ data: { ...customData, bookingId }, handleSetStatus });
      handleSelect('');
      handleSearch('');
      handleClearData();
    }
  };

  const handleConfirm = () => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Xác nhận đã lấy hàng',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: handleOK,
    });
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 0,
    }));
  };

  const updatePickUp = async () => {
    if (id || bookingId) {
      const res = await form.validateFields();
      const customData = {
        details: infoCheckPoint.map(
          ({ quantity, weight, bulkyWeight, height, width, longs }) => {
            return {
              bulkyWeight: parseFloat(bulkyWeight?.toString()),
              quantity: parseFloat(quantity?.toString()),
              weight: parseFloat(weight?.toString()),
              height: parseFloat(height?.toString()),
              width: parseFloat(width?.toString()),
              longs: parseFloat(longs?.toString()),
            };
          }
        ),
        type: res.booking_type?.value || res.booking_type,
        quantity: res.quantity,
        serviceBookingId: servicesId,
        requirePartnerServiceId: res.require_partner_service_id,
        contentDetail: res.content_detail,
        customsDeclarationNumber: res.booking_customs_declaration_number,
        note: res.booking_note,
      };
      updatePu({
        id: id || bookingId,
        data: customData,
        handleSetStatus,
      });
      handleClearData();
    }
  };

  const handleClickOp = () => {
    PUForwardBillToOP({ handelCallback: handleSetStatus });
    form.resetFields();
  };

  const handleAddItem = async () => {
    const ress = await infoForm.validateFields();
    setInfoCheckPoint((prev) => [...prev, ress]);
    setOpen(false);
    infoForm.resetFields();
  };

  const handleUpdate = async (data: any) => {
    setIsUpdate(true);
    setIdKey(data.idKey);
    const bulkyWeightResult = await calculateBulkyWeight({
      serviceId: servicesId,
      width: data?.width,
      height: data?.height,
      longs: data?.longs,
      form: 'MH/src/pages/administrator/pickup/container/index.tsx',
    });

    infoForm.setFieldsValue({
      ...data,
      bulky_weight: bulkyWeightResult,
    });
  };

  const handleUpdateItem = async () => {
    const form = await infoForm.validateFields();

    const res = await Promise.all(
      infoCheckPoint.map(async (x, index) => {
        if (idKey === index) {
          const { bulkyWeight, ...resetForm } = form;
          const bulkyWeightResult = await calculateBulkyWeight({
            serviceId: servicesId,
            width: form.width,
            height: form.height,
            longs: form.longs,
            form: 'MH/src/pages/administrator/pickup/container/index.tsx',
          });

          return {
            ...form,
            bulkyWeight: bulkyWeightResult,
          };
        } else {
          return x;
        }
      })
    );

    setInfoCheckPoint(res);
    setIdKey(undefined);
    setIsUpdate(false);
  };
  const spinning =
    isLoading ||
    isFetching ||
    fetchingPU ||
    loadingPu ||
    loadingPuById ||
    fetchingPuById;

  return (
    <Spin spinning={spinning}>
      <div className='flex flex-col'>
        <div className='flex flex-col items-end'>
          <Table
            columns={rendeColumsPickup(OpitionServiceBooking)}
            rowKey='key'
            onChange={handlePagination}
            className='cursor-pointer'
            dataSource={dataPU?.data}
            pagination={{
              current: dataPU?.pagination?.currentPage,
              total: dataPU?.pagination?.totalCount,
              showSizeChanger: false,
              defaultPageSize: QUERY_PARAMS.pageSize,
              itemRender: ItemControlTableRender,
            }}
            bordered
            onRow={(record) => {
              return {
                onClick: async () => {
                  setIdRowClick(record.pu_delivery_id);
                },
              };
            }}
            scroll={{ y: 300, x: 800 }}
          />
        </div>
        <Form
          form={searchForm}
          className='flex flex-row justify-between py-2 xs:flex-col'
        >
          <Form.Item name='AutoComplete'>
            <AutoComplete
              options={options}
              placeholder='Check point mã bưu phẩm, bưu kiện'
              onChange={(e) => {
                handleSearch(e);
              }}
              className='w-[300px] xs:w-full'
              onSelect={(e: any) => handleSelect(e)}
            />
          </Form.Item>
          <Button
            className='h-8 rounded-md bg-[#FBE51D] px-4 text-white outline-none'
            // disabled={status !== 2}
            onClick={handleClickOp}
          >
            Chuyển tiếp bộ phận OP
          </Button>
        </Form>
        <Row gutter={[8, 0]}>
          <Col lg={14} xs={24} className='mb-4 text-center'>
            <CheckPoint
              form={form}
              opition={OpitionPartnerService}
              bookingType={bookingType}
              dataPackageDetail={infoCheckPoint}
            />
            <Button
              className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'
              onClick={handleConfirm}
              disabled={status !== 0}
            >
              Xác nhận đã lấy hàng từ khách hàng
            </Button>
          </Col>
          <Col lg={10} xs={24}>
            <InfoCheckpoint
              data={infoCheckPoint}
              status={status}
              handleDelete={handleDelete}
              handleOpenCreate={handleOpenModal}
              handleUpdatePickUp={updatePickUp}
              handleUpdate={handleUpdate}
            />
          </Col>
        </Row>

        {(open || isUpdate) && (
          <ModalCreatInfo
            isUpdate={isUpdate}
            form={infoForm}
            listServices={OpitionServiceBooking as Array<OpitionType>}
            servicesId={servicesId || ''}
            handleAddItem={isUpdate ? handleUpdateItem : handleAddItem}
            handleCancel={isUpdate ? () => setIsUpdate(false) : handleClose}
          />
        )}
      </div>
    </Spin>
  );
};

export default PickUpContainer;
