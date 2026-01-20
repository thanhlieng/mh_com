/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutoComplete,
  Button,
  Col,
  Form,
  notification,
  Row,
  Select,
  Spin,
  Table,
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import HeaderModal from '@/components/common/HeaderModal';
import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';
import ItemControlTableRender from '@/components/TableCustom';

import { BookingType, OpitionType } from '@/contants/types';
import ModalCreatInfo from '@/pages/administrator/pickup/container/InfoCheckPoint/ModalInfo/ModalCreate';
import {
  calculateBulkyWeight,
  fetchServicePartnerService,
  fetchServicesBooking,
} from '@/services/booking.services';
import {
  renderColumnsOperate,
  renderColumsInfoItem,
} from '@/utils/contants/columns.contants';
import { QUERY_KEY } from '@/utils/contants/query-key';
import {
  BookingDetailPU,
  getDeliveryConfirm,
  getDeliverySearchPu,
  getPUDelivery,
  getPUIdDelivery,
  QUERY,
} from '@/utils/contants/services';

import FormSplitBill from '../../FormSlitBill';

const QUERY_PARAMS: QUERY = {
  page: 1,
  pageSize: 10,
  search: '',
  orderBy: 'createdAt_DESC',
};

const { Option } = Select;
const OperateContainer = () => {
  const [queries, setQueries] = useState<QUERY>(QUERY_PARAMS);

  const [openSplitBill, setOpenSlitBill] = useState<boolean>(false);

  const router = useRouter();

  const [form] = Form.useForm();
  const [tableForm] = Form.useForm();

  const [searchForm] = Form.useForm();

  const [search, setSearch] = useState<any>('');

  const [statusSplitBooking, setStatusSplitBooking] = useState<{
    parentBookingCode: string | null;
    isSplitedBooking: boolean;
  }>({
    parentBookingCode: null,
    isSplitedBooking: false,
  });
  const [infoCheckPoint, setInfoCheckPoint] = useState<Array<BookingDetailPU>>(
    []
  );

  const [openModal, setOpenModal] = useState<boolean>(false);

  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  const [idRowClick, setIdRowClick] = useState();

  const [status, setStatus] = useState();
  const [idKey, setIdKey] = useState();

  const [idBooking, setIdBooking] = useState<any>();
  const [service, setServices] = useState<string | undefined>();

  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loadingSearch,
    isFetching: fetchingSearch,
  } = useQuery([QUERY_KEY.GET_DATA, { search }], () =>
    getDeliverySearchPu(search)
  );
  const {
    data: dataDelivery,
    isLoading,
    isFetching,
  } = useQuery([QUERY_KEY.GET_DELIVERY, queries], () => getPUDelivery(queries));

  const { mutate: confirm } = useMutation(getDeliveryConfirm, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEY.GET_DELIVERY]);
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
  const OpitionInvoiceItemType = Object.entries(BookingType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  const options = useMemo(() => {
    if (isLoading || isFetching || !data) {
      return [];
    } else {
      return [
        {
          ...data,
          value: data.booking_code,
        },
      ];
    }
  }, [data, isFetching, isLoading]);

  const handlePagination = (pagination: { current?: number }) => {
    setQueries((prev) => ({
      ...prev,
      page: pagination.current || 0,
    }));
  };
  const { data: PartnerServices } = useQuery(
    ['fetchServicePartnerService'],
    () => fetchServicePartnerService()
  );

  const OpitionPartServices = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (PartnerServices?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return PartnerServices?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
  }, [PartnerServices]);

  const { data: dataSerivicesBooknig } = useQuery(
    ['dataSerivicesBooknig', {}],
    () => fetchServicesBooking()
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
  const handleSearch = (e: any) => {
    setSearch(e);
    form.resetFields();
    setIdBooking(undefined);
    setInfoCheckPoint([]);
  };

  const handleSelect = (e: any) => {
    const value = options.find((f) => f.booking_code === e);

    setIdBooking(value?.id || undefined);
    setServices(value?.service_booking_id || '');
    form.setFieldsValue({
      ...value,
      type: OpitionInvoiceItemType.find((x) => x.value === value?.type),
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    setStatus(value?.status);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    const sumBulkyWeight = value?.details
      ?.map((obj: any) => obj.bulkyWeight * obj.quantity)
      .reduce((accumulator: any, current: any) => accumulator + current, 0);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    const sumWeight = value?.details
      ?.map((obj: any) => obj.weight * obj.quantity)
      .reduce((accumulator: any, current: any) => accumulator + current, 0);
    setForm({
      bulkyWeightOperate: sumBulkyWeight.toFixed(2),
      weightOperate: sumWeight,
    });

    setInfoCheckPoint(value?.details || []);
  };

  const handleOpenSplitBill = () => {
    setOpenSlitBill(true);
  };
  const handleCallBackGet = (data: any) => {
    form.setFieldsValue({
      ...data,
      type:
        data?.type && OpitionInvoiceItemType.find((x) => x.value === data.type),
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore

    setStatus(data?.status);
    setIdBooking(data?.id);
    setServices(data?.service_booking_id);
    setInfoCheckPoint(data?.details);
    setStatusSplitBooking({
      parentBookingCode: data?.parent_booking_code,
      isSplitedBooking: data?.is_splited_booking,
    });

    const sumBulkyWeight = data?.details
      ?.map((obj: any) => obj.bulkyWeight * obj.quantity)
      .reduce((accumulator: any, current: any) => accumulator + current, 0);

    const sumWeight = data?.details
      ?.map((obj: any) => obj.weight * obj.quantity)
      .reduce((accumulator: any, current: any) => accumulator + current, 0);
    setForm({
      bulkyWeightOperate: sumBulkyWeight,
      weightOperate: sumWeight,
    });
  };
  const { isLoading: loadingPuById, isFetching: fetchingPuById } = useQuery(
    [QUERY_KEY.GET_DATA, idRowClick],
    () => getPUIdDelivery({ id: idRowClick, handleCallBack: handleCallBackGet })
  );

  const handleSubmit = async () => {
    if (idBooking) {
      const res = await form.validateFields();
      const newREs = {
        type: res.type.value || res.type,
        serviceBookingId: res.service_booking_id,
        customsDeclarationNumber: res.customs_declaration_number,
        note: res.note,
        bookingPartnerBillCode: res.booking_partner_bill_code,
        bookingPartnerService:
          res.booking_partner_service?.value || res.booking_partner_service,
        contentDetailInvoice: res.content_detail_invoice,
        informationReceiverAddress: res.information_receiver_address,
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
      };
      confirm({ id: idBooking, data: newREs });
      searchForm.resetFields();
      form.resetFields();
      setInfoCheckPoint([]);
    }
  };

  const handleChangeService = (v: any) => {
    setServices(v);
  };

  const handleDelete = (id: any) => {
    const res = infoCheckPoint.filter((x, index) => id !== index);
    setInfoCheckPoint(res);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleUpdate = (data: any) => {
    setIsUpdate(true);
    setIdKey(data.idKey);
    tableForm.setFieldsValue({
      ...data,
      bulkyWeight: data.bulkyWeight,
    });
  };

  useEffect(() => {
    const fetchBulkyWeight = async () => {
      const width = 0;
      const height = 0;
      const longs = 0;

      const bulkyWeightResult = await calculateBulkyWeight({
        serviceId: service,
        width: width,
        height: height,
        longs: longs,
        form: 'MH/src/container/MangerContainer/components/components/ModalUpdateBookingDetails.tsx',
      });

      const bulkyWeight = bulkyWeightResult || 0;
      tableForm.setFieldValue(bulkyWeight, bulkyWeight);
    };

    fetchBulkyWeight();
  }, [tableForm]);

  const handleAddItem = async () => {
    const ress = await tableForm.validateFields();
    setInfoCheckPoint((prev) => [...prev, ress]);
    setForm({
      bulkyWeightOperate:
        parseFloat(ress.bulky_weight) * parseFloat(ress.quantity) || 0,
      weightOperate: parseFloat(ress.quantity) * parseFloat(ress.weight) || 0,
    });
    setOpenModal(false);
    tableForm.resetFields();
  };

  const handleUpdateItem = async () => {
    const form = await tableForm.validateFields();

    const res = infoCheckPoint.map((x, index) => {
      if (idKey === index) {
        const { bulkyWeight, ...resetForm } = form;

        setForm({
          bulkyWeightOperate:
            parseFloat(bulkyWeight) * parseFloat(resetForm.quantity),
          weightOperate:
            parseFloat(resetForm.quantity) * parseFloat(resetForm.weight),
        });
        return form;
      } else {
        return x;
      }
    });

    setInfoCheckPoint(res);
    setIdKey(undefined);
    setIsUpdate(false);
  };

  const setForm = ({
    bulkyWeightOperate,
    weightOperate,
  }: {
    weightOperate: number;
    bulkyWeightOperate: number;
  }) => {
    form.setFieldsValue({
      weightOperate,
      bulkyWeightOperate,
    });
  };
  // weightOperate bulkyWeightOperate
  return (
    <Spin
      spinning={
        isLoading ||
        isFetching ||
        loadingSearch ||
        fetchingSearch ||
        loadingPuById ||
        fetchingPuById
      }
    >
      <div className='flex flex-col'>
        <div className='flex flex-col items-end'>
          <Table
            columns={renderColumnsOperate()}
            rowKey='key'
            onChange={handlePagination}
            className='cursor-pointer'
            dataSource={dataDelivery?.data}
            pagination={{
              current: dataDelivery?.pagination?.currentPage,
              total: dataDelivery?.pagination?.totalCount,
              showSizeChanger: false,
              defaultPageSize: QUERY_PARAMS.pageSize,
              itemRender: ItemControlTableRender,
            }}
            bordered
            onRow={(record) => {
              return {
                onClick: async () => {
                  searchForm.setFieldsValue({
                    AutoComplete: record.booking_code,
                  });
                  setIdRowClick(record.id);
                },
              };
            }}
            scroll={{ y: 300, x: 800 }}
          />
        </div>
        <div>
          <Row>
            <Col xs={24} lg={12} className='grid grid-cols-2 sm:grid-cols-1'>
              <Form form={searchForm}>
                <Form.Item name='AutoComplete'>
                  <AutoComplete
                    options={options}
                    placeholder='Check point mã bưu phẩm, bưu kiện'
                    onChange={(e) => handleSearch(e)}
                    className='w-[300px] xs:w-full'
                    onSelect={(e: any) => handleSelect(e)}
                  />
                </Form.Item>
              </Form>
              {statusSplitBooking.parentBookingCode !== null ? (
                <Button disabled={true}>
                  Bill con của : {statusSplitBooking.parentBookingCode}
                </Button>
              ) : statusSplitBooking.isSplitedBooking ? (
                <Button onClick={handleOpenSplitBill} disabled={true}>
                  Đơn hàng đã thực hiện chia bill
                </Button>
              ) : (
                <Button onClick={handleOpenSplitBill}>Tách bill</Button>
              )}
            </Col>

            <Col
              xs={24}
              lg={12}
              className='text-right'
              onClick={() => router.push('operate/operate-statistic')}
            >
              <Button className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'>
                Tiếp tục
              </Button>
            </Col>
          </Row>
        </div>
        <div className='w-full'>
          <Form form={form} className='grid grid-cols-2 xs:grid-cols-1'>
            <div>
              <Row gutter={[8, 0]}>
                <Col xs={24} lg={12}>
                  <Form.Item name='booking_code'>
                    <VInput label='Mã bill' isHorizal disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item name='booking_partner_bill_code'>
                    <VInput label='Mã Bill đối tác' isHorizal />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item name='type'>
                    <VSelect label='Loại hàng hóa' isHorizal>
                      {OpitionInvoiceItemType?.map((v) => (
                        <Option value={v.value} key={v.value}>
                          {v.label}
                        </Option>
                      ))}
                    </VSelect>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item name='quantity_pu'>
                    <VInput label='Số kiện' isHorizal disabled />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item name='weight_pu'>
                    <VInput label='Trọng lượng thực (PU)' isHorizal disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='bulky_weight_pu'>
                    <VInput
                      label='Trọng lượng cồng kềnh (PU)'
                      isHorizal
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item name='weightOperate'>
                    <VInput label='Trọng lượng thực (VH)' isHorizal disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='bulkyWeightOperate'>
                    <VInput
                      label='Trọng lượng cồng kềnh (VH)'
                      isHorizal
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item name='final_weight'>
                    <VInput label='Trọng lượng chốt cước' isHorizal disabled />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item name='customs_declaration_number'>
                    <VInput label='Tờ khai hải quan' isHorizal />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item name='customer_code'>
                    <VInput label='Mã khách hàng' isHorizal disabled />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item name='customer_full_name'>
                    <VInput label='Tên khách hàng' isHorizal disabled />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item
                    name='service_booking_id'
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn dịch vụ',
                      },
                    ]}
                  >
                    <VSelect
                      label='Dịch vụ'
                      isHorizal
                      onChange={handleChangeService}
                      required
                      showSearch
                    >
                      {OpitionServiceBooking?.map((v: OpitionType) => (
                        <Option value={v.value} key={v.value}>
                          {v.label}
                        </Option>
                      ))}
                    </VSelect>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item
                    name='booking_partner_service'
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn dịch vụ kết nối',
                      },
                    ]}
                  >
                    <VSelect
                      label='Dịch vụ kết nối'
                      isHorizal
                      required
                      showSearch
                    >
                      {OpitionPartServices?.map((v: OpitionType) => (
                        <Option value={v.value} key={v.value}>
                          {v.label}
                        </Option>
                      ))}
                    </VSelect>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={24}>
                  <Form.Item name='content_detail_invoice'>
                    <VInput
                      label='Nội dung chi tiết bưu phẩm bưu kiện'
                      isHorizal
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={24}>
                  <Form.Item name='note'>
                    <VInput label='Ghi chú' isHorizal />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={24}>
                  <Form.Item name='information_receiver_address'>
                    <VTextArea
                      label='Thông tin địa chỉ nơi đến'
                      isHorizal
                      className='h-[100px]'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className='flex flex-col'>
              <Table
                columns={renderColumsInfoItem({
                  handleDelete,
                  isDisable: status === 2,
                  handleUpdate,
                })}
                rowKey='key'
                // onChange={handlePagination}
                className='cursor-pointer px-6'
                dataSource={infoCheckPoint}
                pagination={false}
              />
              <div className='mt-4 flex flex-row items-center justify-center gap-4 xs:flex-col'>
                <Button
                  className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'
                  onClick={handleOpenModal}
                  disabled={!idBooking}
                >
                  Thêm mới kiện hàng
                </Button>
              </div>
            </div>
          </Form>
        </div>
        <Modal
          footer={null}
          open={openSplitBill}
          title={
            <HeaderModal
              title='Tách bill'
              onClose={() => setOpenSlitBill(false)}
            />
          }
          destroyOnClose
          closable={false}
          onCancel={() => setOpenSlitBill(false)}
          className='top-[calc(5vh)] w-[calc(70vw)] sm:top-0 sm:w-screen'
        >
          <FormSplitBill puDeliveryId={idBooking} services={service || ''} />
        </Modal>
        <div className='text-right xs:mt-10 xs:text-center'>
          <Button
            onClick={handleSubmit}
            className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'
            disabled={status !== 3 || !idBooking}
          >
            Xác nhận
          </Button>
        </div>
        {(openModal || isUpdate) && (
          <ModalCreatInfo
            form={tableForm}
            handleCancel={() => {
              setOpenModal(false);
              setIsUpdate(false);
            }}
            listServices={OpitionServiceBooking || []}
            handleAddItem={isUpdate ? handleUpdateItem : handleAddItem}
            servicesId={service || ''}
            isUpdate={isUpdate}
          />
        )}
      </div>
    </Spin>
  );
};

export default OperateContainer;
