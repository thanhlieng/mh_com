/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrinterOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Form, Modal, notification, Tabs } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ModalReason from '@/components/ModalReason';

import { QUERY_BOOKING } from '@/contants/query-key/booking.query';
import {
  DetailsBookingPost,
  IInvoiceDetails,
  InvoiceItemType,
  InvoiceType,
  OpitionType,
} from '@/contants/types';
import useGetDeleveryId from '@/hook/getDeleveryId';
import useGetPermission from '@/hook/getPermission';
import {
  AddNewInvoice,
  cancelBillAdmin,
  confirmBooking,
  fetchCheckBillCanBeCancel,
  fetchCurrentUnit,
  fetchServicePartnerServiceByZone,
  fetchServicesBooking,
  generateBillAdmin,
  generateBillPatner,
  generateInvoiceAdmin,
  generateInvoicePatner,
  generateSmallBill,
  generateSplitBookingBill,
} from '@/services/booking.services';
import { updatePartnerBillCode } from '@/services/employee.services';

import TabsDetailsBooking from './TabsDetailsBooking';
import TabsDetailsInvoice from './TabsDetailsInvoice';

const ViewBookingDetails = ({ data }: { data: any }) => {
  //dsads

  const { t } = useTranslation('booking');
  const [detailsInVoice, setDetailInvoice] = useState<Array<IInvoiceDetails>>(
    []
  );

  const [openModalReason, setOpenModalReason] = useState<boolean>(false);
  const [reasonForm] = Form.useForm();

  const { permissions } = useGetPermission();

  const [detailsNewInvoice, setDetailsNewInvoice] = useState<
    Array<IInvoiceDetails>
  >([]);

  const handleSetDetailsInvoice = (data: Array<IInvoiceDetails>) => {
    setDetailsNewInvoice(data);
  };

  const [billPartner, setBillPartner] = useState<string | null | undefined>();

  const [detailsBooking, setDetailsBooking] = useState<
    Array<DetailsBookingPost>
  >([]);

  const [value, setValue] = useState(1);

  const [viewBooking] = Form.useForm();

  const { mutate: handleSubmit } = useMutation(updatePartnerBillCode, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
      notification.success({
        message: 'Cập nhật bưu code thành công',
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

  const { mutate: handleAddNewInvoice } = useMutation(AddNewInvoice, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
      notification.success({
        message: 'Cập nhật bưu code thành công',
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

  const { mutate: genInvoicePartner, isLoading: genInvoicePartnerLoading } =
    useMutation(generateInvoicePatner, {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
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

  const { data: PartnerServicesDOMESTIC } = useQuery(
    ['fetchServicePartnerServiceDOMESTIC'],
    () => fetchServicePartnerServiceByZone('DOMESTIC')
  );
  const { data: PartnerServicesFOREIGN } = useQuery(
    ['fetchServicePartnerServiceFOREIGN'],
    () => fetchServicePartnerServiceByZone('FOREIGN')
  );

  const OpitionPartServicesDOMESTIC = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (PartnerServicesDOMESTIC?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return PartnerServicesDOMESTIC?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
  }, [PartnerServicesDOMESTIC]);

  const OpitionPartServicesFOREIGN = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (PartnerServicesFOREIGN?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return PartnerServicesFOREIGN?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
  }, [PartnerServicesFOREIGN]);

  const handleGeneratorInvoicePartner = () => {
    if (data?.booking?.id) {
      genInvoicePartner(data.booking.id);
    }
  };

  const handleSetBillCode = (bill: string) => {
    setBillPartner(bill);
  };
  const onSubmit = async () => {
    const res = await viewBooking.validateFields();

    if (res.partnerBillCode) {
      const newRes = {
        referenceCode: res?.referenceCode,
        partnerBillCode: res?.partnerBillCode,
        partnerService: res?.partnerService,
        manufacture: res?.manufacture,
        partnerBillCodeDomestic: res?.partnerBillCodeDomestic,
        partnerServiceDomestic:
          res?.partnerServiceDomestic?.value || res?.partnerServiceDomestic,
        manufactureDomestic: res?.manufactureDomestic,
        partnerBillCodeForeign: res?.partnerBillCodeForeign,
        partnerServiceForeign:
          res?.partnerServiceForeign?.value || res?.partnerServiceForeign,
        manufactureForeign: res?.manufactureForeign,
        valueAddedService1: res?.valueAddedService1,
        valueAddedService2: res?.valueAddedService2,
        valueAddedService3: res?.valueAddedService3,
        dhl: res?.dhl,
        fedex: res?.fedex,
        ups: res?.ups,
      };

      handleSubmit({
        id: data?.booking?.id,
        data: newRes,
        handleSetBillCode,
      });
    } else {
      notification.error({
        message: 'Vui lòng nhập mã bưu đối tác',
        placement: 'top',
      });
    }
  };

  const handleSaveInvoice = async () => {
    const res = await viewBooking.validateFields();
    const configDetailsInvoice = detailsNewInvoice.map(
      ({ totalMoney, ...rest }) => rest
    );

    const newInvoice = {
      invoiceDetail: configDetailsInvoice,
      typeItemInvoice: res.typeItemInvoice,
      invoiceType: res.invoiceType,
      invoiceDate: moment(res.invoiceDate).format('YYYY-MM-DD'),
      invoiceNumber: res.invoiceNumber,
      serviceId: res.serviceBookingId,
      totalNetWeight: res.totalNetWeight * res.totalBaleNumber,
      totalBulkyWeight: res.totalBulkyWeight * res.totalBaleNumber,
      goodsSize: res.goodsSize,
      totalBaleNumber: res.totalBaleNumber,
      currencyId: res.currencyId,
      reasonExport: res.reasonExport,
      bookingId: data?.booking?.id,
      senderInformation: res.senderInformation,
      receiverInformation: res.receiverInformation,
    };

    handleAddNewInvoice(newInvoice);
  };
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

  const OpitionInvoiceItemType = Object.entries(InvoiceItemType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const OpitionInvoiceType = Object.entries(InvoiceType).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );
  const { data: dataCurrenUnit } = useQuery(['fetchCurrentUnit', {}], () =>
    fetchCurrentUnit()
  );
  const OpitionCurrencyUnit = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (dataCurrenUnit?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return dataCurrenUnit?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
  }, [dataCurrenUnit]);
  const { opitionDeliveryConditions } = useGetDeleveryId();

  useEffect(() => {
    const typeItemInvoice = OpitionInvoiceItemType.find(
      (x) => x.value === data?.invoice?.typeItemInvoice
    );

    const invoiceType = OpitionInvoiceType.find(
      (x) => x.value === data?.invoice?.invoiceType
    );
    const partnerServiceDomestic = OpitionPartServicesDOMESTIC?.find(
      (x: OpitionType) => x.value === data?.booking?.partnerServiceDomestic
    );
    const partnerServiceForeign = OpitionPartServicesFOREIGN?.find(
      (x: OpitionType) => x.value === data?.booking?.partnerServiceForeign
    );

    const currencyId = OpitionCurrencyUnit?.find(
      (x: OpitionType) => x.value === data?.invoice?.currencyId
    );
    const deliveryConditionId = opitionDeliveryConditions.find(
      (x: any) => x.value === data?.booking?.deliveryConditionId
    );
    viewBooking.setFieldsValue({
      ...data?.booking,
      ...data?.invoice,
      typeItemInvoice,
      invoiceType,
      currencyId,
      deliveryConditionId,
      reasonExport: data?.invoice?.reasonExport,
      invoiceNumber: data?.invoice?.invoiceNumber,
      estimatedDate: moment(data?.booking?.estimatedDate),
      invoiceDate: moment(data?.invoice?.invoiceDate),
      estimateHour: moment(data?.booking?.estimateHour, 'HH:mm'),
      importProceduresPerson: data?.invoice?.importers,
      totalNetWeight:
        data?.invoice?.totalNetWeight * data?.invoice?.totalBaleNumber,
      totalBulkyWeight:
        data?.invoice?.totalBulkyWeight * data?.invoice?.totalBaleNumber,
      goodsSize: data?.invoice?.goodsSize,
      totalBaleNumber: data?.invoice?.totalBaleNumber,
      partnerServiceDomestic,
      partnerServiceForeign,
      serviceId:
        OpitionServiceBooking?.filter(
          (x: any) => x.value === data?.invoice?.serviceId
        )[0]?.label || undefined,
      type: data?.booking?.type,
    });
    const detailBooking = data?.booking?.bookingDetail?.map((v: any) => {
      const { updatedAt, createdAt, ...res } = v;
      const detailsObject = { ...res, numb22: res.bulkyWeight * res.quantity };
      return detailsObject;
    });
    setDetailInvoice(data?.invoice?.invoiceDetail || []);
    setValue(data?.booking.customsDeclarationNumber ? 2 : 1);
    setDetailsBooking(detailBooking || []);
    setBillPartner(data?.booking?.partnerBillCode);
  }, [data]);

  const queryClient = useQueryClient();
  const { mutate: generatorBill, isLoading: generatorBillLoading } =
    useMutation(generateBillAdmin, {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
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

  const { mutate: generatorInvoice } = useMutation(generateInvoiceAdmin, {
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
  });

  const { mutate: confirmBooking2 } = useMutation(confirmBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
      notification.success({
        message: 'Cập nhật thành công',
        placement: 'top',
      });
    },
    //dsadsa
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Cập nhật thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: cancelBillOrder } = useMutation(cancelBillAdmin, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
      notification.success({
        message: 'Hủy đơn  thành công',
        placement: 'top',
      });
      setOpenModalReason(false);
    },
    onError: () => {
      notification.error({
        message: 'Hủy đơn thất bại',
        placement: 'top',
      });
    },
  });
  const { mutate: genBillPatner, isLoading: genBillPatnerLoading } =
    useMutation(generateBillPatner, {
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
    });
  const { mutate: genBillSmall, isLoading: generateSmallBillLoading } =
    useMutation(generateSmallBill, {
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
    });
  const {
    mutate: genSplitBookingBill,
    isLoading: generateSplitBookingBillLoading,
  } = useMutation(generateSplitBookingBill, {
    onSuccess: () => {
      queryClient.invalidateQueries(['generateSplitBookingBill']);
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

  const handleGenerataeBill = () => {
    generatorBill(data?.booking?.id);
  };
  const handleGenerataeInvoice = () => {
    generatorInvoice(data?.booking?.id);
  };

  const handleGeneratorBillPartner = () => {
    genBillPatner(data?.booking?.id);
  };
  const handleGenSmallBill = () => {
    genBillSmall(data?.booking?.id);
  };
  const handleGenSplitBookingBill = () => {
    genSplitBookingBill(data?.booking?.id);
  };

  const handleConfrimSucces = () => {
    if (data?.booking?.id) {
      confirmBooking2(data?.booking?.id);
    }
  };

  const handleCancelBill = (reason: string) => {
    if (data?.booking?.id) {
      cancelBillOrder({ id: data?.booking?.id, reason });
    }
  };

  const handleDeleteBill = async (row: any) => {
    const checkBillCanbeCancel = await fetchCheckBillCanBeCancel(
      data?.booking?.id
    );
    if (checkBillCanbeCancel?.can_be_cancel === false) {
      Modal.confirm({
        title: 'Thông báo',
        icon: <WarningOutlined className='text-red-700' />,
        content: 'Đơn hàng đã được Pickup nên không thể hủy đơn hàng !',
      });
    } else {
      setOpenModalReason(true);
    }
  };
  const onDeleteBill = async () => {
    const res = await reasonForm.validateFields();
    handleCancelBill(res.reason);
  };
  const handleAddInvoiceDetails = (resForm: any) => {
    setDetailsNewInvoice((prev) => [...prev, resForm]);
  };
  const handleDeleteNewInvoiceDetails = (id: any) => {
    const res = detailsNewInvoice.filter((x, index) => id !== index);
    setDetailsNewInvoice(res);
  };

  const handleUpdateBookingInvoice = (form: any) => {
    const res = detailsNewInvoice.map((x, index) => {
      if (form.idKey === index) {
        const { idKey, ...resetForm } = form;
        return resetForm;
      } else {
        return x;
      }
    });

    setDetailsNewInvoice(res);
  };
  return (
    <div>
      <div>
        {data?.booking?.reasonCancelBooking && (
          <p className='text-xl text-red-500'>{`Lý do hủy đơn hàng : ${
            data?.booking?.reasonCancelBooking
          } - ${moment(data?.booking?.canceledAt).format(
            'DD/MM/YYYY hh:mm:ss'
          )}`}</p>
        )}
      </div>
      <div className='mb-4 flex flex-wrap gap-4 xs:p-2 '>
        <Button
          onClick={handleGenerataeBill}
          type='primary'
          loading={generatorBillLoading}
          disabled={!data?.booking?.id}
          icon={<PrinterOutlined />}
        >
          {t('Print Bill')}
        </Button>

        <Button
          onClick={handleGenerataeInvoice}
          type='primary'
          loading={generateSmallBillLoading}
          disabled={!data?.booking?.id || !data?.booking?.isInvoice}
          icon={<PrinterOutlined />}
        >
          {t('Print Invoice')}
        </Button>

        {billPartner && data?.booking?.partnerService && (
          <Button
            onClick={handleGeneratorBillPartner}
            type='primary'
            loading={genBillPatnerLoading}
            disabled={!data?.booking?.id}
            icon={<PrinterOutlined />}
          >
            In bưu đối tác
          </Button>
        )}

        {billPartner && data?.booking?.isInvoice && (
          <Button
            onClick={handleGeneratorInvoicePartner}
            type='primary'
            disabled={!data?.booking?.id}
            loading={genInvoicePartnerLoading}
            icon={<PrinterOutlined />}
          >
            In Invoice đối tác
          </Button>
        )}
        <Button
          onClick={handleGenSmallBill}
          type='primary'
          loading={generateSmallBillLoading}
          icon={<PrinterOutlined />}
        >
          In bưu nhỏ
        </Button>

        {data?.booking?.isSplitedBookingManifest && (
          <Button
            onClick={handleGenSplitBookingBill}
            type='primary'
            loading={generateSplitBookingBillLoading}
            icon={<PrinterOutlined />}
          >
            In bưu tách
          </Button>
        )}

        {!data?.booking?.isInvoice && (
          <Button
            onClick={handleSaveInvoice}
            type='primary'
            disabled={!data?.booking?.id}
          >
            Lưu Invoice
          </Button>
        )}

        {permissions?.includes('confirm_handle_booking') &&
          billPartner &&
          data?.booking?.partnerService &&
          !data?.booking.is_handle && (
            <Button
              onClick={handleConfrimSucces}
              type='primary'
              loading={generateSmallBillLoading}
              icon={<PrinterOutlined />}
            >
              Xác nhận đã xử lý
            </Button>
          )}
      </div>

      <div className='h-[calc(70vh)] overflow-y-auto p-5'>
        <Tabs type='card'>
          <Tabs.TabPane tab='Booking' key='Booking'>
            <TabsDetailsBooking
              form={viewBooking}
              handleSetDetailsInvoice={handleSetDetailsInvoice}
              handleDeleteInvoice={handleDeleteNewInvoiceDetails}
              handleAddInvoice={handleAddInvoiceDetails}
              detailsBooking={detailsBooking}
              value={value}
              isInvoice={data?.booking?.isInvoice}
              detailNewInvoice={detailsNewInvoice}
              handleUpdateBookingInvoice={handleUpdateBookingInvoice}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab='Invoice'
            key='invoice'
            disabled={!data?.booking?.isInvoice}
          >
            <TabsDetailsInvoice
              form={viewBooking}
              detailInVoice={detailsInVoice}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>

      {!data?.booking?.reasonCancelBooking && (
        <div className='flex flex-row gap-4'>
          {permissions?.includes('update_booking') && (
            <Button className='mt-5' type='primary' onClick={onSubmit}>
              {t('Update Order')}
            </Button>
          )}

          <Button
            className='mt-5'
            type='primary'
            onClick={handleDeleteBill}
            danger
          >
            {t('Cancel Order')}
          </Button>
        </div>
      )}
      {data?.booking?.reasonCancelBooking && data?.booking?.isHandle && (
        <div className='flex flex-row gap-4'>
          {permissions?.includes('update_booking') && (
            <Button className='mt-5' type='primary' onClick={onSubmit}>
              Cập nhật đơn hàng
            </Button>
          )}
        </div>
      )}
      <ModalReason
        form={reasonForm}
        isOpen={openModalReason}
        onClose={() => setOpenModalReason(false)}
        onSubmit={onDeleteBill}
      />
    </div>
  );
};

export default ViewBookingDetails;
