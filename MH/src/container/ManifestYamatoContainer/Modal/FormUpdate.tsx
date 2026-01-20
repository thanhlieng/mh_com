/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { Button, Form, notification } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import ToogleButton from '@/components/ToggleButton';
import InVoice from '@/container/MangerContainer/components/Invoice';
import TabsBooking from '@/container/MangerContainer/components/TabsBooking';

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
  fetchCurrentUnit,
  fetchUser,
  getMyBookingById,
  updateBookingManifest,
} from '@/services/booking.services';

const UpdateBookingForManifest = ({
  idRow,
  onClosePopup,
  data,
}: {
  idRow?: string;
  data: any;
  onClosePopup: () => void;
}) => {
  const [detailsInvoice, setDetailsInvoice] = useState<Array<IInvoiceDetails>>(
    []
  );
  const [detailsBooking, setDetailsBooking] = useState<
    Array<DetailsBookingPost>
  >([]);

  const [statusBooking, setStatusBooking] = useState<BookingStatusPost>();
  const { t } = useTranslation('booking');
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

  const [isEcommerceService, setIsEcommerceService] = useState<boolean>(false);
  const [isReferenceCode, setReferenceCode] = useState<boolean>(false);

  const [active, setActive] = useState<boolean>(true);

  const router = useRouter();

  const { data: dataSENDER_ADDRESS_VN } = useGetAddressBook({
    type: EAddressBookingType.SENDER_ADDRESS,
  });

  const { data: dataViewBooking } = useQuery(
    ['ModalViewBooking', router.query.idBooking],
    () => getMyBookingById(router.query.idBooking)
  );
  useEffect(() => {
    const typeItemInvoice = OpitionInvoiceItemType.find(
      (x) => x.value === data?.invoice?.typeItemInvoice
    );

    const invoiceType = OpitionInvoiceType.find(
      (x) => x.value === data?.invoice?.invoiceType
    );

    const currencyId = OpitionCurrencyUnit?.find(
      (x: OpitionType) => x.value === data?.invoice?.currencyId
    );
    const newValueSender = dataSENDER_ADDRESS_VN?.find((x) => x.default);
    const newValueReceive = dataSENDER_ADDRESS_VN?.find((x) => x.default);

    const senderNameVi = dataSENDER_ADDRESS_VN?.find((x) => x.default);
    const receiverAddress = dataRECEIVER_ADDRESS?.find((x) => x.default);
    const deliveryConditionId = opitionDeliveryConditions.find(
      (x: any) => x.value === data?.booking?.deliveryConditionId
    );
    form.setFieldsValue({
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
      senderAddressEn1: data?.booking?.senderAddressEn1,
      senderAddressEn2: data?.booking?.senderAddressEn2,
      senderAddressEn3: data?.booking?.senderAddressEn3,
      receiverAddress:
        receiverAddress?.address || data?.booking?.receiverAddress,
      autoSelectSender: {
        value: newValueSender?.id,
        label: newValueSender?.senderNameVi,
      },
      autoSelectReceive: {
        value: newValueReceive?.id,
        label: newValueReceive?.senderNameVi,
      },
      type: data?.booking?.type,
    });

    const detailBooking = data?.booking?.bookingDetail?.map((v: any) => {
      const { updatedAt, createdAt, ...res } = v;
      const detailsObject = { ...res, numb22: res.bulkyWeight * res.quantity };
      return detailsObject;
    });

    setValue(data?.booking.customsDeclarationNumber ? 2 : 1);
    setDetailsBooking(detailBooking || []);
    setIsInvoice(data?.booking.isInvoice);
    setDetailsInvoice(data?.invoice?.invoiceDetail || []);
    setSelected(data?.booking?.serviceBookingId);
    setAddressCustome((prev) => ({
      ...prev,
      ...data?.booking,
      senderNameVi: data?.booking?.senderNameVi,
      senderAddressVi: senderNameVi?.address || data?.booking?.senderAddressVi,
      senderProvince: data?.booking?.senderProvince,
      senderCountry: data?.booking?.senderCountry,
      senderPhoneNumber: data?.booking?.senderPhoneNumber,
      senderPostalCode: data?.booking?.senderPostalCode,
      senderContactPerson: data?.booking?.senderContactPerson,
    }));

    setReceiverCustome((prev) => ({
      ...prev,
      ...data?.booking,
      receiverPostalCode: data?.booking.receiverPostalCode,
      receiverName: data?.booking?.receiverName,
      receiverPhoneNumber: data?.booking?.receiverPhoneNumber,
      receiverCountry: data?.booking?.receiverCountry,
      province: data?.booking?.receiverProvince,
      receiverAddress:
        receiverAddress?.address || data?.booking?.receiverAddress,
    }));
    setStatusBooking(data?.booking.status);
  }, [data, form]);
  const { opitionDeliveryConditions } = useGetDeleveryId();

  const { mutate: mutateCreate } = useMutation(updateBookingManifest, {
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_BOOKING.GET_BOOKING]);
      notification.success({
        message: 'Cập nhật đơn hàng thành công',
        placement: 'top',
      });
      onClosePopup();
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data
            ? e.response.data.message
            : 'Vui lòng kiểm tra lại các trường còn thiếu'
        }`,
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

  const { data: dataSenderAddress } = useGetAddressBook({
    type: EAddressBookingType.SENDER_ADDRESS,
  });

  const { data: dataRECEIVER_ADDRESS } = useGetAddressBook({
    type: EAddressBookingType.RECEIVER_ADDRESS,
  });

  const onSubmit = async () => {
    if (idRow) {
      form
        .validateFields()
        .then((res) => {
          const dataCreateBooking: Partial<BookingPost> = res;

          const estimatedDate = moment(dataCreateBooking.estimatedDate).format(
            'YYYY-MM-DD'
          );
          const estimateHour = moment(dataCreateBooking.estimateHour).format(
            'HH:mm'
          );

          const configDetailsInvoice = detailsInvoice.map(
            ({ totalMoney, ...rest }) => rest
          );

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
          } = dataCreateBooking;

          const booking = {
            booking: {
              receiverNote: receiverNote || data?.booking?.receiverNote,
              receiverCountry:
                receiverCountry || data?.booking?.receiverCountry,
              receiverContactPerson:
                receiverContactPerson || data?.booking?.receiverContactPerson,
              receiverDepartment:
                receiverDepartment || data?.booking?.receiverDepartment,
              receiverPhoneNumber:
                receiverPhoneNumber || data?.booking?.receiverPhoneNumber,
              otherDeliveryConditions:
                otherDeliveryConditions ||
                data?.booking?.otherDeliveryConditions,
              note: note || data?.booking?.note,
              receiverPostalCode:
                receiverPostalCode || data?.booking?.receiverPostalCode,
              receiverProvince:
                receiverProvince || data?.booking?.receiverProvince,
              receiverTown: receiverTown || data?.booking?.receiverTown,
              receiverAddress1:
                receiverAddress1 || data?.booking?.receiverAddress1,
              receiverAddress2:
                receiverAddress2 || data?.booking?.receiverAddress2,
              receiverAddress3:
                receiverAddress3 || data?.booking?.receiverAddress3,
              payment: payment || data?.booking?.payment,
              typeOfPaymentId:
                typeOfPaymentId || data?.booking?.typeOfPaymentId,
              partnerBillCode:
                partnerBillCode || data?.booking?.partnerBillCode,
              oderAccountForeign:
                oderAccountForeign || data?.booking?.oderAccountForeign,
              customsDeclarationNumber:
                customsDeclarationNumber ||
                data?.booking?.customsDeclarationNumber,
              type: type || data?.booking?.type,
              deliveryConditionId:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                deliveryConditionId?.value ||
                deliveryConditionId ||
                data?.booking?.deliveryConditionId,
              serviceBookingId:
                serviceBookingId || data?.booking?.serviceBookingId,
              estimatedDate: estimatedDate || data?.booking?.estimatedDate,
              estimateHour: estimateHour,
              senderNameEn: senderNameEn || data?.booking?.senderNameEn,
              senderAddressEn1:
                senderAddressEn1 || data?.booking?.senderAddressEn1,
              senderAddressEn2:
                senderAddressEn2 || data?.booking?.senderAddressEn2,
              senderAddressEn3:
                senderAddressEn3 || data?.booking?.senderAddressEn3,
              senderContactPerson:
                senderContactPerson || data?.booking?.senderContactPerson,
              senderDepartment:
                senderDepartment || data?.booking?.senderDepartment,
              senderPhoneNumber:
                senderPhoneNumber || data?.booking?.senderPhoneNumber,
              senderNote: senderNote || data?.booking?.senderNote,
              senderOtherShippingAddress:
                senderOtherShippingAddress ||
                data?.booking?.senderOtherShippingAddress,
              senderPostalCode:
                senderPostalCode || data?.booking?.senderPostalCode,
              senderProvince: senderProvince || data?.booking?.senderProvince,
              senderCountry: senderCountry || data?.booking?.senderCountry,
              senderTown: senderTown || data?.booking?.senderTown,
              receiverName: receiverName || data?.booking?.receiverName,
              isCustomsDeclaration: false,
              isInvoice,
              bookingDetail: detailsBooking.map((v) => {
                const { numb22, ...res } = v;
                return {
                  ...res,
                };
              }),
            },
            invoice: {
              invoiceDetail: configDetailsInvoice,
              typeItemInvoice:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                typeItemInvoice?.value ||
                typeItemInvoice ||
                data?.invoice?.typeItemInvoice,

              invoiceType:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                invoiceType?.value || invoiceType || data?.invoice?.invoiceType,
              importers: importProceduresPerson,
              invoiceDate: moment(
                dataCreateBooking?.invoiceDate || data?.invoice?.invoiceDate
              ).format('YYYY-MM-DD'),
              invoiceNumber:
                dataCreateBooking?.invoiceNumber ||
                data?.invoice?.invoiceNumber,
              serviceId:
                dataCreateBooking?.serviceBookingId ||
                data?.invoice?.serviceBookingId,
              totalNetWeight: dataCreateBooking?.totalNetWeight
                ? +dataCreateBooking.totalNetWeight
                : +data?.invoice?.totalNetWeight *
                  data?.invoice?.totalBaleNumber,
              totalBulkyWeight: dataCreateBooking?.totalBulkyWeight
                ? +dataCreateBooking?.totalBulkyWeight
                : +data?.invoice?.totalBulkyWeight *
                  data?.invoice?.totalBaleNumber,
              goodsSize: dataCreateBooking?.goodsSize
                ? +dataCreateBooking.goodsSize
                : +data?.invoice?.goodsSize,
              totalBaleNumber: dataCreateBooking?.totalBaleNumber
                ? +dataCreateBooking?.totalBaleNumber
                : +data?.invoice?.totalBaleNumber,
              currencyId:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                dataCreateBooking?.currencyId?.value ||
                dataCreateBooking?.currencyId ||
                data?.invoice?.currencyId,
              reasonExport:
                dataCreateBooking?.reasonExport || data?.invoice?.reasonExport,
              noteInvoice:
                dataCreateBooking?.noteInvoice || data?.invoce?.noteInvoice,
            },
          };
          const booking2 = {
            booking: {
              receiverNote: receiverNote || data?.booking?.receiverNote,
              receiverCountry:
                receiverCountry || data?.booking?.receiverCountry,
              receiverContactPerson:
                receiverContactPerson || data?.booking?.receiverContactPerson,
              receiverDepartment:
                receiverDepartment || data?.booking?.receiverDepartment,
              receiverPhoneNumber:
                receiverPhoneNumber || data?.booking?.receiverPhoneNumber,
              otherDeliveryConditions:
                otherDeliveryConditions ||
                data?.booking?.otherDeliveryConditions,
              note: note || data?.booking?.note,
              receiverPostalCode:
                receiverPostalCode || data?.booking?.receiverPostalCode,
              receiverProvince:
                receiverProvince || data?.booking?.receiverProvince,
              receiverTown: receiverTown || data?.booking?.receiverTown,
              receiverAddress1:
                receiverAddress1 || data?.booking?.receiverAddress1,
              receiverAddress2:
                receiverAddress2 || data?.booking?.receiverAddress2,
              receiverAddress3:
                receiverAddress3 || data?.booking?.receiverAddress3,
              payment: payment || data?.booking?.payment,
              typeOfPaymentId:
                typeOfPaymentId || data?.booking?.typeOfPaymentId,
              partnerBillCode:
                partnerBillCode || data?.booking?.partnerBillCode,
              oderAccountForeign:
                oderAccountForeign || data?.booking?.oderAccountForeign,
              customsDeclarationNumber:
                customsDeclarationNumber ||
                data?.booking?.customsDeclarationNumber,
              type: type || data?.booking?.type,
              deliveryConditionId:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //  @ts-ignore
                deliveryConditionId?.value ||
                deliveryConditionId ||
                data?.booking?.deliveryConditionId,
              serviceBookingId:
                serviceBookingId || data?.booking?.serviceBookingId,
              estimatedDate: estimatedDate || data?.booking?.estimatedDate,
              estimateHour: estimateHour,
              senderNameEn: senderNameEn || data?.booking?.senderNameEn,
              // senderAddressEn: senderAddressEn || data?.booking?.senderAddressEn,
              senderAddressEn1:
                senderAddressEn1 || data?.booking?.senderAddressEn1,
              senderAddressEn2:
                senderAddressEn2 || data?.booking?.senderAddressEn2,
              senderAddressEn3:
                senderAddressEn3 || data?.booking?.senderAddressEn3,
              senderContactPerson:
                senderContactPerson || data?.booking?.senderContactPerson,
              senderDepartment:
                senderDepartment || data?.booking?.senderDepartment,
              senderPhoneNumber:
                senderPhoneNumber || data?.booking?.senderPhoneNumber,
              senderNote: senderNote || data?.booking?.senderNote,
              senderOtherShippingAddress:
                senderOtherShippingAddress ||
                data?.booking?.senderOtherShippingAddress,
              senderPostalCode:
                senderPostalCode || data?.booking?.senderPostalCode,
              senderProvince: senderProvince || data?.booking?.senderProvince,
              senderCountry: senderCountry || data?.booking?.senderCountry,
              senderTown: senderTown || data?.booking?.senderTown,
              receiverName: receiverName || data?.booking?.receiverName,
              isCustomsDeclaration: false,
              isInvoice,
              bookingDetail: detailsBooking.map((v) => {
                const { numb22, ...res } = v;
                return {
                  ...res,
                };
              }),
            },
          };

          mutateCreate({
            id: idRow,
            booking: isInvoice ? booking : booking2,
          });
        })
        .catch((err) => {
          notification.error({
            message:
              `Vui lòng nhập: ` +
              `${err.errorFields
                .map((v: any) =>
                  v.errors.toString().replace('Vui lòng chọn ', '')
                )
                .toString()
                .replace('Vui lòng chọn ', '')}`,
            placement: 'top',
          });
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
    console.log(`==>`, newValue);
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
        ...dataViewBooking?.invoice,
        typeItemInvoice,
        invoiceType,
        currencyId,
        deliveryConditionId,
        reasonExport: dataViewBooking?.invoice?.reasonExport,
        invoiceNumber: dataViewBooking?.invoice?.invoiceNumber,
        estimatedDate: moment(dataViewBooking?.booking?.estimatedDate),
        invoiceDate: moment(),
        estimateHour: moment(dataViewBooking?.booking?.estimateHour, 'HH:mm'),
        importProceduresPerson: dataViewBooking?.invoice?.importers,
        totalNetWeight:
          dataViewBooking?.invoice?.totalNetWeight *
          dataViewBooking?.invoice?.totalBaleNumber,
        totalBulkyWeight:
          dataViewBooking?.invoice?.totalBulkyWeight *
          dataViewBooking?.invoice?.totalBaleNumber,
        goodsSize: dataViewBooking?.invoice?.goodsSize,
        totalBaleNumber: dataViewBooking?.invoice?.totalBaleNumber,
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
      setIsInvoice(dataViewBooking?.booking.isInvoice);
      setDetailsInvoice(dataViewBooking?.invoice?.invoiceDetail || []);
      setSelected(dataViewBooking?.booking?.serviceBookingId);
    }
  }, [dataViewBooking]);

  const handleUpdateReferenceCode = (value: any) => {
    if (value === '' || !value) {
      console.log('set false');
      setReferenceCode(false);
    } else {
      console.log('set true');
      setReferenceCode(true);
    }
  };

  return (
    <div>
      <div className='flex flex-row gap-4'>
        <Button
          onClick={onSubmit}
          disabled={id ? true : false}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          Lưu
        </Button>
        <Button
          onClick={() => setIsInvoice(!isInvoice)}
          className='h-[38px] rounded-[10px] border-0  bg-[#1464a9] text-[14px]  leading-[17px] text-[#fff] outline-0'
        >
          {isInvoice ? t('No Invoice') : t('With Invoice')}
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
          disableAddress={true}
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

export default UpdateBookingForManifest;
