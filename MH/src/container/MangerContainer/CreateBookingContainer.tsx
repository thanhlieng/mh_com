/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { PrinterOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Form, Modal, notification } from 'antd';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ToogleButton from '@/components/ToggleButton';

import { QUERY_BOOKING } from '@/contants/query-key/booking.query';
import {
  AddressCustomer,
  BookingPost,
  BookingStatusPost,
  DetailsBookingPost,
  EAddressBookingType,
  IInvoiceDetails,
  InvoiceItemType,
  InvoiceType,
  OpitionType,
  ReceiverCustome,
} from '@/contants/types';
import useGetAddressBook from '@/hook/getAdressBook';
import useGetDeleveryId from '@/hook/getDeleveryId';
import {
  createBooking,
  fetchCurrentUnit,
  fetchUser,
  generateBill,
  generateInvoice,
  generateReferenceBill,
  generateSmallBill,
  getMyBookingById,
  updateBooking,
  updateStatusBooking,
} from '@/services/booking.services';

import InVoice from './components/Invoice';
const TabsBooking = dynamic(() => import('./components/TabsBooking'), {
  ssr: false,
});

const CreateBookingContainer = () => {
  const [detailsInvoice, setDetailsInvoice] = useState<Array<IInvoiceDetails>>(
    []
  );
  const [detailsBooking, setDetailsBooking] = useState<
    Array<DetailsBookingPost>
  >([]);
  const { t } = useTranslation('booking');
  const [statusBooking, setStatusBooking] = useState<BookingStatusPost>();
  const [isEcommerceService, setIsEcommerceService] = useState<boolean>(false);
  const [isReferenceCode, setReferenceCode] = useState<boolean>(false);

  const [id, setId] = useState<string | null | undefined>();
  const [addressCustome, setAddressCustome] =
    useState<Partial<AddressCustomer>>();

  const [receiverCustome, setReceiverCustome] =
    useState<Partial<ReceiverCustome>>();

  const [isInvoice, setIsInvoice] = useState<boolean>(true);

  const [value, setValue] = useState(1);

  const [selected, setSelected] = useState();

  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { data: userData } = useQuery(['getuser'], () => fetchUser());

  const [active, setActive] = useState<boolean>(true);

  const router = useRouter();

  const { data: dataViewBooking } = useQuery(
    ['ModalViewBooking', router.query.idBooking],
    () => getMyBookingById(router.query.idBooking)
  );

  const { opitionDeliveryConditions } = useGetDeleveryId();

  const { mutate: mutateCreate } = useMutation(createBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
      notification.success({
        message: 'Tạo đơn hàng mới thành công',
        placement: 'top',
      });
    },
    onError: (e) => {
      notification.error({
        message: 'Vui lòng kiểm tra lại các trường còn thiếu',
        placement: 'top',
      });
    },
  });

  const { mutate: mutateUpdate } = useMutation(updateBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries(['updateBooking']);
      notification.success({
        message: 'Cập nhật đơn hàng thành công',
        placement: 'top',
      });
    },
    onError: (err: any) => {
      notification.error({
        message: `${
          err.response.data
            ? err.response.data.message
            : 'Cập nhật đơn hàng thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const { mutate: mutateUpdateStautsBooking } = useMutation(
    updateStatusBooking,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['updateBooking']);
        notification.success({
          message: 'Cập nhật đơn hàng thành công',
          placement: 'top',
        });
      },
      onError: () => {
        notification.error({
          message: 'Some thing when wrong ,Please try again !!',
          placement: 'top',
        });
      },
    }
  );

  const { mutate: generatorBill } = useMutation(generateBill, {
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

  const { mutate: generatorInvoice } = useMutation(generateInvoice, {
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

  const handleAddInvoiceDetails = (resForm: any) => {
    setDetailsInvoice((prev) => [...prev, resForm]);
  };

  const onSelect = (e: any) => {
    setSelected(e);
  };

  const handleSetValue = (value: any) => {
    setValue(value);
  };

  const handleAddBookingDetails = (detailsForm: any) => {
    const {
      bulkyWeight,
      calculationUnit,
      commoditiesTypeId,
      description,
      height,
      longs,
      note,
      originItem,
      quantity,
      shippingItemEn,
      shippingItemViId,
      weight,
      width,
    } = detailsForm;
    const resForm = {
      bulkyWeight,
      calculationUnit,
      commoditiesTypeId,
      description,
      height,
      longs,
      note,
      originItem,
      quantity,
      shippingItemEn,
      shippingItemViId,
      weight,
      width,
    };
    setDetailsBooking((prev) => [...prev, resForm]);

    const prevDetails = [...detailsBooking, resForm];
    const bulkyWeightValue = 0;
    const quantityValue = 0;
    const weightValue = 0;

    const totalNetWeight = prevDetails
      .map(({ weight }) => weight)
      .reduce(
        (previousValue, currentValue) =>
          parseFloat(previousValue) + parseFloat(currentValue),
        weightValue
      );

    const totalBulkyWeight = prevDetails
      .map(({ bulkyWeight }) => bulkyWeight)
      .reduce(
        (previousValue, currentValue) =>
          parseFloat(previousValue) + parseFloat(currentValue),
        bulkyWeightValue
      );
    const totalBaleNumber = prevDetails
      .map(({ quantity }) => quantity)
      .reduce(
        (previousValue, currentValue) =>
          parseFloat(previousValue) + parseFloat(currentValue),
        quantityValue
      );
    const goodsSize = prevDetails.map(({ height, width, longs }, index) => {
      if (index === prevDetails.length - 1) {
        return `${height} x ${width} x ${longs}`;
      }
      return `${height} x ${width} x ${longs},`;
    });
    form.setFieldsValue({
      totalNetWeight,
      totalBulkyWeight,
      totalBaleNumber,
      goodsSize,
    });

    // form
  };

  const handleChangeInfoSender = (name: string, value: any) => {
    setAddressCustome((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeInfoRecei = (name: string, value: any) => {
    setReceiverCustome((prev) => ({ ...prev, [name]: value }));
  };
  const handleSetId = (id: string) => {
    setId(id);
  };

  const handleSetStatus = (value: BookingStatusPost) => {
    setStatusBooking(value);
  };

  const { data: dataSenderAddress, isLoading: senderLoading } =
    useGetAddressBook({
      type: EAddressBookingType.SENDER_ADDRESS,
    });

  const { data: dataRECEIVER_ADDRESS } = useGetAddressBook({
    type: EAddressBookingType.RECEIVER_ADDRESS,
  });

  const onSubmit = async () => {
    try {
      const res = await form.validateFields();
      const dataCreateBooking: Partial<BookingPost> = res;

      // Format dates and times
      const estimatedDate = moment(
        dataCreateBooking.estimatedDate ||
          dataViewBooking?.booking?.estimatedDate
      ).format('YYYY-MM-DD');
      const estimateHour = moment(
        dataCreateBooking.estimateHour || dataViewBooking?.booking?.estimateHour
      ).format('HH:mm');

      // Process detailsInvoice
      const configDetailsInvoice = detailsInvoice.map(
        ({ totalMoney, ...rest }) => rest
      );

      // Extract fields for booking payload
      const {
        receiverNote,
        receiverCountry,
        receiverContactPerson,
        receiverDepartment,
        receiverPhoneNumber,
        receiverPhoneNumber2,
        otherDeliveryConditions,
        note,
        receiverPostalCode,
        typeOfPaymentId,
        receiverAddress1,
        receiverAddress2,
        receiverAddress3,
        receiverTown,
        payment,
        partnerBillCode,
        oderAccountForeign,
        customsDeclarationNumber,
        type,
        senderNameEn,
        senderAddressEn,
        senderContactPerson,
        senderDepartment,
        senderPhoneNumber,
        senderPhoneNumber2,
        senderNote,
        deliveryConditionId,
        serviceBookingId,
        receiverName,
        typeItemInvoice,
        invoiceType,
        importProceduresPerson,
        senderPostalCode,
        senderProvince,
        senderCountry,
        receiverProvince,
        isCustomerCreateDeclaration,
        senderAddressEn1,
        senderAddressEn2,
        senderAddressEn3,
        senderTown,
        senderOtherShippingAddress,
        referenceCode,
      } = dataCreateBooking;

      // Define booking object
      const createBookingObject = (useInvoice = false) => ({
        booking: {
          otherDeliveryConditions: otherDeliveryConditions,
          note: note,
          payment: payment,
          typeOfPaymentId: typeOfPaymentId,
          partnerBillCode: partnerBillCode,
          oderAccountForeign: oderAccountForeign,
          customsDeclarationNumber: customsDeclarationNumber,
          type: type,

          deliveryConditionId:
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            deliveryConditionId?.value || deliveryConditionId,
          serviceBookingId: serviceBookingId,
          estimatedDate,
          estimateHour,
          isCustomsDeclaration: false,
          isInvoice: isInvoice,
          isCustomerCreateDeclaration:
            isCustomerCreateDeclaration ||
            dataViewBooking?.booking?.isCustomerCreateDeclaration,
          senderNameEn: senderNameEn,
          senderAddressEn1: senderAddressEn1,
          senderAddressEn2: senderAddressEn2,
          senderAddressEn3: senderAddressEn3,
          senderTown: senderTown,
          senderContactPerson: senderContactPerson,
          senderDepartment: senderDepartment,
          senderPhoneNumber: senderPhoneNumber,
          senderPhoneNumber2: senderPhoneNumber2,
          senderNote,
          senderOtherShippingAddress: senderOtherShippingAddress,
          senderPostalCode: senderPostalCode,
          senderProvince: senderProvince,
          senderCountry: senderCountry,
          receiverNote: receiverNote,
          receiverCountry: receiverCountry,
          receiverContactPerson: receiverContactPerson,
          receiverDepartment: receiverDepartment,
          receiverPhoneNumber: receiverPhoneNumber,
          receiverPhoneNumber2: receiverPhoneNumber2,
          receiverPostalCode: receiverPostalCode,
          receiverName: receiverName,
          receiverAddress1: receiverAddress1,
          receiverAddress2: receiverAddress2,
          receiverAddress3: receiverAddress3,
          receiverTown: receiverTown,
          receiverProvince: receiverProvince,
          referenceCode: referenceCode,
          bookingDetail: detailsBooking.map(({ numb22, ...rest }) => rest),
        },
        invoice: useInvoice
          ? {
              invoiceDetail: configDetailsInvoice.map(
                ({ id, invoiceId, ...rest }: any) => rest
              ),
              typeItemInvoice:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                typeItemInvoice?.value || typeItemInvoice,
              invoiceType:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                invoiceType?.value || invoiceType,
              senderInformation: `${senderAddressEn1} ${senderAddressEn2} ${senderAddressEn3}`,
              receiverInformation: `${receiverAddress1} - ${receiverAddress2} - ${receiverAddress3}`,
              importers: importProceduresPerson,
              invoiceDate: moment(dataCreateBooking?.invoiceDate).format(
                'YYYY-MM-DD'
              ),
              invoiceNumber: dataCreateBooking?.invoiceNumber,
              serviceId: dataCreateBooking?.serviceBookingId,
              totalNetWeight:
                (dataCreateBooking?.totalNetWeight || 0) *
                (dataCreateBooking?.totalBaleNumber || 0),
              totalBulkyWeight:
                (dataCreateBooking?.totalBulkyWeight || 0) *
                (dataCreateBooking?.totalBaleNumber || 0),
              goodsSize: dataCreateBooking?.goodsSize,
              totalBaleNumber: dataCreateBooking?.totalBaleNumber,
              currencyId:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                dataCreateBooking?.currencyId?.value ||
                dataCreateBooking?.currencyId,
              reasonExport: dataCreateBooking?.reasonExport,
              note: dataCreateBooking?.noteInvoice,
            }
          : undefined,
      });

      // Validate time and check booking detail
      if (createBookingObject(isInvoice).booking.bookingDetail.length === 0) {
        notification.error({
          message: 'Vui lòng nhập thông tin chi tiết booking',
          placement: 'top',
        });
      } else if (
        moment(`${estimatedDate} ${estimateHour}`).isAfter(Date.now())
      ) {
        if (id) {
          mutateUpdate({ booking: createBookingObject(isInvoice), id });
        } else {
          mutateCreate({
            booking: createBookingObject(isInvoice),
            handleSetId,
            handleSetStatus,
          });
        }
      } else {
        notification.error({
          message: 'Vui lòng chọn ngày và giờ giao hàng sau thời gian hiện tại',
          placement: 'top',
        });
      }
    } catch (err: any) {
      notification.error({
        message: `Vui lòng nhập: ${err.errorFields
          .map((v: any) => v.errors.toString().replace('Vui lòng chọn ', ''))
          .join(', ')}`,
        placement: 'top',
      });
    }
  };

  const handleUpdateBookingDetails = (data: any) => {
    const res = detailsBooking.map((x, index) => {
      if (data.idKey === index) {
        const { idKey, ...resetForm } = data;
        return resetForm;
      } else {
        return x;
      }
    });

    setDetailsBooking(res);

    const bulkyWeightValue = 0;
    const quantityValue = 0;
    const weightValue = 0;

    const totalNetWeight = res
      .map(({ weight }) => weight)
      .reduce(
        (previousValue, currentValue) =>
          parseFloat(previousValue) + parseFloat(currentValue),
        weightValue
      );

    const totalBulkyWeight = res
      .map(({ bulkyWeight }) => bulkyWeight)
      .reduce(
        (previousValue, currentValue) =>
          parseFloat(previousValue) + parseFloat(currentValue),
        bulkyWeightValue
      );
    const totalBaleNumber = res
      .map(({ quantity }) => quantity)
      .reduce(
        (previousValue, currentValue) =>
          parseFloat(previousValue) + parseFloat(currentValue),
        quantityValue
      );
    const goodsSize = res.map(({ height, width, longs }, index) => {
      if (index === res.length - 1) {
        return `${height} x ${width} x ${longs}`;
      }
      return `${height} x ${width} x ${longs},`;
    });

    form.setFieldsValue({
      totalNetWeight,
      totalBulkyWeight,
      totalBaleNumber,
      goodsSize,
    });
  };

  const handleDeleteRow = (id: any) => {
    const res = detailsBooking.filter((x, index) => id !== index);
    setDetailsBooking(res);
  };

  const handleDeleteInvoice = (id: any) => {
    const res = detailsInvoice.filter((x, index) => id !== index);
    setDetailsInvoice(res);
  };

  const { mutate: genReferenceBill } = useMutation(generateReferenceBill, {
    onSuccess: () => {
      queryClient.invalidateQueries(['generateBillPatner']);
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

  const handleUpdateBookingInvoice = (data: any) => {
    const res = detailsInvoice.map((x, index) => {
      if (data.idKey === index) {
        const { idKey, ...resetForm } = data;
        return resetForm;
      } else {
        return x;
      }
    });

    setDetailsInvoice(res);
  };

  const handleGenerataeBill = () => {
    if (id) {
      generatorBill(id);
    }
  };

  const handleGeneratorInvoice = () => {
    if (id) {
      generatorInvoice(id);
    }
  };

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
  const handleNewForm = async () => {
    Modal.confirm({
      title: 'Cảnh báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Tạo booking mới sẽ xóa hết dữ liệu hiện có',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: () => router.reload(),
    });
  };

  const updateStatus = () => {
    if (id) {
      mutateUpdateStautsBooking({
        id,
        handleSetStatus,
      });
    }
  };
  const handleGenSmallBill = () => {
    if (id) {
      genBillSmall(id);
    }
  };

  const handleReferenceBill = () => {
    if (id) {
      genReferenceBill(id);
    }
  };

  const handleAutoSender = (value: any) => {
    const newValue = dataSenderAddress?.find((x) => x.id === value);
    form.setFieldsValue({
      senderContactPerson: newValue.senderContactPerson,
      senderPhoneNumber: newValue.senderPhoneNumber,
      senderPhoneNumber2: newValue.senderPhoneNumber2,
      senderProvince: newValue.senderProvince,
      senderCountry: newValue.senderCountry,
      senderNameEn: newValue.senderNameEn,
      senderAddressEn1: newValue.senderAddressEn1,
      senderAddressEn2: newValue.senderAddressEn2,
      senderAddressEn3: newValue.senderAddressEn3,
      senderTown: newValue.senderTown,
      senderPostalCode: newValue.senderPostalCode,
    });
  };

  const handleAutoReceive = (value: any) => {
    const newValue = dataRECEIVER_ADDRESS?.find((x) => x.id === value);
    form.setFieldsValue({
      receiverName: newValue.receiverName,
      receiverAddress1: newValue.receiverAddress1,
      receiverAddress2: newValue.receiverAddress2,
      receiverAddress3: newValue.receiverAddress3,
      receiverPostalCode: newValue.receiverPostalCode,
      receiverCountry: newValue.receiverCountry,
      receiverProvince: newValue.receiverProvince,
      receiverTown: newValue.receiverTown,
      receiverContactPerson: newValue.receiverContactPerson,
      receiverPhoneNumber: newValue.receiverPhoneNumber,
      receiverPhoneNumber2: newValue.receiverPhoneNumber2,
    });
  };

  const handleUpdateReferenceCode = (value: any) => {
    if (value === '' || !value) {
      console.log('set false');
      setReferenceCode(false);
    } else {
      console.log('set true');
      setReferenceCode(true);
    }
  };

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

  const { data: dataCurrenUnit } = useQuery(['fetchCurrentUnit2', {}], () =>
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
  }, [dataCurrenUnit]);

  useEffect(() => {
    if (dataViewBooking) {
      const typeItemInvoice = OpitionInvoiceItemType.find(
        (x) => x.value === dataViewBooking?.invoice?.typeItemInvoice
      );
      const invoiceType = OpitionInvoiceType.find(
        (x) => x.value === dataViewBooking?.invoice?.invoiceType
      );

      const currencyId = OpitionCurrencyUnit?.find(
        (x: OpitionType) => x.value === dataViewBooking?.invoice?.currencyId
      );
      const deliveryConditionId = opitionDeliveryConditions.find(
        (x) => x.value === dataViewBooking.booking.deliveryConditionId
      );

      form.setFieldsValue({
        ...dataViewBooking?.booking,
        // ...dataViewBooking?.invoice,
        // typeItemInvoice,
        // invoiceType,
        currencyId,
        deliveryConditionId,
        // reasonExport: dataViewBooking?.invoice?.reasonExport,
        // invoiceNumber: dataViewBooking?.invoice?.invoiceNumber,
        estimatedDate: moment(dataViewBooking?.booking?.estimatedDate),
        invoiceDate: moment(),
        estimateHour: moment(dataViewBooking?.booking?.estimateHour, 'HH:mm'),
        // importProceduresPerson: dataViewBooking?.invoice?.importers,
        // totalNetWeight: dataViewBooking?.invoice?.totalNetWeight,
        // totalBulkyWeight: dataViewBooking?.invoice?.totalBulkyWeight,
        // goodsSize: dataViewBooking?.invoice?.goodsSize,
        // totalBaleNumber: dataViewBooking?.invoice?.totalBaleNumber,
        receiverAddress: dataViewBooking?.booking?.receiverAddress,
        type: dataViewBooking?.booking?.type,
      });
      const detailBooking = dataViewBooking?.booking?.bookingDetail?.map(
        (v: any) => {
          const { updatedAt, createdAt, id, ...res } = v;
          const detailsObject = {
            ...res,
            numb22: res.bulkyWeight * res.quantity,
          };
          return detailsObject;
        }
      );
      setValue(dataViewBooking?.booking.customsDeclarationNumber ? 2 : 1);
      setDetailsBooking(detailBooking || []);
      setAddressCustome(dataViewBooking?.booking);
      setIsInvoice(false);
      // setDetailsInvoice(dataViewBooking?.invoice?.invoiceDetail || []);
      setSelected(dataViewBooking?.booking?.serviceBookingId);
      handleUpdateReferenceCode(dataViewBooking?.booking?.referenceCode);
    }
  }, [dataViewBooking]);

  return (
    <div>
      <div className='my-5 flex flex-wrap items-center justify-center gap-4 '>
        <Button
          onClick={onSubmit}
          disabled={id ? true : false}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Save')}
        </Button>
        <Button
          onClick={onSubmit}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
          disabled={
            !id || statusBooking !== BookingStatusPost.NOT_YET_HANDED_OVER
          }
        >
          {/* Cập nhật đơn hàng */}
          {t('Update Order')}
        </Button>

        <Button
          onClick={handleReferenceBill}
          disabled={!isReferenceCode || !isEcommerceService || !id}
          icon={<PrinterOutlined />}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Print Reference')}
        </Button>
        <Button
          onClick={updateStatus}
          disabled={statusBooking !== BookingStatusPost.NOT_YET_HANDED_OVER}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Confirm Order')}
        </Button>
        <Button
          onClick={handleGenerataeBill}
          disabled={!id}
          icon={<PrinterOutlined />}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Print Bill')}
        </Button>
        <Button
          onClick={handleGeneratorInvoice}
          disabled={!id || !isInvoice}
          icon={<PrinterOutlined />}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Print Invoince')}
        </Button>
        <Button
          onClick={() => setIsInvoice(!isInvoice)}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
          disabled={
            statusBooking === BookingStatusPost.DONE ||
            statusBooking === BookingStatusPost.CANCEL ||
            statusBooking === BookingStatusPost.HANDED_OVER
          }
        >
          {isInvoice ? t('No Invoice') : t('With Invoice')}
        </Button>
        <Button
          onClick={handleNewForm}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Create New Booking')}
        </Button>

        <Button
          onClick={handleGenSmallBill}
          disabled={!id}
          loading={generateSmallBillLoading}
          icon={<PrinterOutlined />}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {t('Print Postcard')}
        </Button>
      </div>

      <div className='mb-[20px] mt-[40px] w-full px-2 text-center'>
        <ToogleButton
          checked={active}
          handleClick={() => setActive(!active)}
          unCheckTitle='Invoice'
          checkedTitle='Booking'
        />
      </div>

      <div className={`${!active && 'hidden'}`}>
        <TabsBooking
          form={form}
          userData={userData}
          addressCustome={addressCustome}
          handleDeleteRow={handleDeleteRow}
          detailsBooking={detailsBooking}
          handleAddBookingDetails={handleAddBookingDetails}
          handleUpdateBookingDetails={handleUpdateBookingDetails}
          handleChangeInfoSender={handleChangeInfoSender}
          handleChangeInfoRecei={handleChangeInfoRecei}
          serivcesSelected={selected}
          handleServicesSelected={onSelect}
          value={value}
          handleSetValue={handleSetValue}
          handleAutoSender={handleAutoSender}
          handleAutoReceive={handleAutoReceive}
          setIsEcommerceService={setIsEcommerceService}
          handleUpdateReferenceCode={handleUpdateReferenceCode}
        />
      </div>
      <div className={`${active && 'hidden'}`}>
        <InVoice
          form={form}
          dataUser={userData}
          sendAddress={addressCustome}
          detailsInvoice={detailsInvoice}
          isInvoice={isInvoice}
          receiverCustome={receiverCustome}
          handleAddInvoiceDetails={handleAddInvoiceDetails}
          handleDeleteInvoice={handleDeleteInvoice}
          handleUpdateBookingInvoice={handleUpdateBookingInvoice}
          serivcesSelected={selected}
        />
      </div>
    </div>
  );
};

export default CreateBookingContainer;
