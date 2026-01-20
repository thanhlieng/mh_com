/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

import FileUpload from '@/components/FileUpLoad';

import { IManifestYamato } from '@/services/manifest.yamato.services';

import { PrinterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { USER } from '../Storage';
import { EPermission } from '../common.constants';

export interface manifestColumnFunctionHandler {
  handleClick: (data: any) => void;
  handleUploadFile: (row: any, data: any) => void;
  handleGeneratePartnerBill: (data: any) => void;
  handleGenerateInvoice: (data: any) => void;
}

export const manifestColumns = (
  page: number,
  handleClickFunction: manifestColumnFunctionHandler
) => {
  const user = localStorage.getItem(USER);

  const { permissions } = JSON.parse(user || '');

  const isForPartner = (permissions as string[]).find((v: string) =>
    [
      EPermission.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      EPermission.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      EPermission.MANAGE_MANIFEST_K_CARGO_PARTNER,
    ].includes(v as EPermission)
  );

  const columnsManifestYamato: ColumnsType<IManifestYamato> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 40,
      fixed: true,
      render: (_text, _object, index) => {
        return (
          <span className='text-center'>{(page - 1) * 10 + index + 1}</span>
        );
      },
    },
    {
      title: 'Tracking No',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      align: 'center',
      width: 150,
      fixed: true,
      render: (text: string, row: any) => {
        return (
          <div
            onClick={() => handleClickFunction.handleClick(row)}
            className='cursor-pointer text-[#fe8f0c]'
          >
            {text}
          </div>
        );
      },
    },
    {
      title: 'Cnee Company',
      dataIndex: 'cneeCompany',
      key: 'cneeCompany',
      align: 'center',
      width: 150,
      fixed: true,
    },
    {
      title: 'Ship Date',
      dataIndex: '  shipDate',
      key: 'shipDate',
      align: 'center',
      width: 150,
      render: (e) => <span>{moment(e).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Handling Type',
      dataIndex: 'handlingType',
      key: 'handlingType',
      align: 'center',
      width: 120,
    },
    {
      title: 'Shipment Type',
      dataIndex: 'shipmentType',
      key: 'shipmentType',
      align: 'center',
      width: 120,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Shipper Name',
      dataIndex: 'shipperName',
      key: 'shipperName',
      align: 'center',
      width: 350,
    },
    {
      title: 'Shipper Add 1',
      dataIndex: 'shipperAdd1',
      key: 'shipperAdd1',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Add 2',
      dataIndex: 'shipperAdd2',
      key: 'shipperAdd2',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Add 3',
      dataIndex: 'shipperAdd3',
      key: 'shipperAdd3',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Add 4',
      dataIndex: 'shipperAdd4',
      key: 'shipperAdd3',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Postal Code',
      dataIndex: 'shipperPostalCode',
      key: 'shipperPostalCode',
      align: 'center',
      width: 150,
    },
    {
      title: 'Shipper Phone',
      dataIndex: 'shipperPhone',
      key: 'shipperPhone',
      align: 'center',
      width: 150,
    },
    {
      title: 'Package ID',
      dataIndex: 'packageID',
      key: 'packageID',
      align: 'center',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Tracking No',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      align: 'center',
      width: 150,
    },
    {
      title: 'Reference No',
      dataIndex: 'referenceNoManifest',
      key: 'referenceNoManifest',
      align: 'center',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Cnee Company',
      dataIndex: 'cneeCompany',
      key: 'cneeCompany',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee Add 1',
      dataIndex: 'cneeAdd1',
      key: 'cneeAdd1',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Add 2',
      dataIndex: 'cneeAdd2',
      key: 'cneeAdd2',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Add 3',
      dataIndex: 'cneeAdd3',
      key: 'cneeAdd3',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Add 4',
      dataIndex: 'cneeAdd4',
      key: 'cneeAdd4',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Tel',
      dataIndex: 'cneeTel',
      key: 'cneeTel',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee Postal Code',
      dataIndex: 'cneePostalCode',
      key: 'cneePostalCode',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee name in Katakana',
      dataIndex: 'cneeNameInKatakana',
      key: 'cneeNameInKatakana',
      align: 'center',
      width: 200,
    },
    {
      title: 'GW',
      dataIndex: 'gwManifest',
      key: 'gwManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Unit of Weight',
      dataIndex: 'unitOfWeight',
      key: 'unitOfWeight',
      align: 'center',
      width: 100,
    },
    {
      title: 'Payment Term',
      dataIndex: 'paymentTermManifest',
      key: 'paymentTermManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Freight Charge',
      dataIndex: 'freightChargeManifest',
      key: 'freightChargeManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      align: 'center',
      width: 100,
    },
    {
      title: 'Item Name',
      dataIndex: 'itemNameManifest',
      key: 'itemNameManifest',
      align: 'center',
      width: 120,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: ' Origin of Country',
      dataIndex: 'originOfCountry',
      key: 'originOfCountry',
      align: 'center',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'QTY',
      dataIndex: 'qtyManifest',
      key: 'qtyManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'UOM',
      dataIndex: 'uomManifest',
      key: 'uomManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPriceManifest',
      key: 'unitPriceManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Invoice Cur',
      dataIndex: 'invoiceCurManifest',
      key: 'invoiceCurManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Length',
      dataIndex: 'lengthManifest',
      key: 'lengthManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Width',
      dataIndex: 'widthManifest',
      key: 'widthManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Height',
      dataIndex: 'heightManifest',
      key: 'heightManifest',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Length Unit',
      dataIndex: 'lengthUnit',
      key: 'lengthUnit',
      align: 'center',
      width: 100,
    },
    {
      title: 'Insurance',
      dataIndex: 'insurance',
      key: 'insurance',
      align: 'center',
      width: 100,
    },
    {
      title: 'Consignee Japan name',
      dataIndex: 'consigneeNameJapaneseManifest',
      key: 'consigneeNameJapaneseManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Consignee code',
      dataIndex: 'consigneeCodeManifest',
      key: 'consigneeCodeManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Registered company name',
      dataIndex: 'registeredCompanyNameManifest',
      key: 'registeredCompanyNameManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Address',
      dataIndex: 'addressManifest',
      key: 'addressManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Import invoice file',
      key: 'partnerInvoiceFile',
      dataIndex: 'partnerInvoiceFile',
      align: 'center',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      isUploadFile: true,
      render: (text: string, row: any) => {
        return (
          <div>
            <FileUpload
              handleSetFileList={(data: any) =>
                handleClickFunction.handleUploadFile(row, data)
              }
              fileList={null}
              label={row?.isUploadedPartnerInvoiceFile ? 'Uploaded' : 'File'}
            />
          </div>
        );
      },
    },
    {
      title: 'Xuất bill',
      key: 'id',
      dataIndex: 'id',
      align: 'center',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      render: (text: string, row: any) => {
        return (
          <div>
            <Button
              onClick={() =>
                handleClickFunction.handleGeneratePartnerBill(text)
              }
              type='primary'
              icon={<PrinterOutlined />}
              style={{ marginBottom: '10px', width: '130px' }}
            >
              Tải Bill
            </Button>
            <Button
              onClick={() => handleClickFunction.handleGenerateInvoice(text)}
              type='primary'
              style={{ width: '130px' }}
              icon={<PrinterOutlined />}
              disabled={!row?.isInvoice}
            >
              Tải Invoice
            </Button>
          </div>
        );
      },
    },
  ];
  const columnsIsForPartner: ColumnsType<IManifestYamato> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 40,
      fixed: true,
      render: (_text, _object, index) => {
        return (
          <span className='text-center'>{(page - 1) * 10 + index + 1}</span>
        );
      },
    },
    {
      title: 'Tracking No',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      align: 'center',
      width: 150,
      fixed: true,
    },
    {
      title: 'Cnee Company',
      dataIndex: 'cneeCompany',
      key: 'cneeCompany',
      align: 'center',
      width: 150,
      fixed: true,
    },
    {
      title: 'Ship Date',
      dataIndex: '  shipDate',
      key: 'shipDate',
      align: 'center',
      width: 150,
      render: (e) => <span>{moment(e).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Handling Type',
      dataIndex: 'handlingType',
      key: 'handlingType',
      align: 'center',
      width: 120,
    },
    {
      title: 'Shipment Type',
      dataIndex: 'shipmentType',
      key: 'shipmentType',
      align: 'center',
      width: 120,
    },
    {
      title: 'Shipper Name',
      dataIndex: 'shipperName',
      key: 'shipperName',
      align: 'center',
      width: 350,
    },
    {
      title: 'Shipper Add 1',
      dataIndex: 'shipperAdd1',
      key: 'shipperAdd1',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Add 2',
      dataIndex: 'shipperAdd2',
      key: 'shipperAdd2',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Add 3',
      dataIndex: 'shipperAdd3',
      key: 'shipperAdd3',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Add 4',
      dataIndex: 'shipperAdd4',
      key: 'shipperAdd3',
      align: 'center',
      width: 300,
    },
    {
      title: 'Shipper Postal Code',
      dataIndex: 'shipperPostalCode',
      key: 'shipperPostalCode',
      align: 'center',
      width: 150,
    },
    {
      title: 'Shipper Phone',
      dataIndex: 'shipperPhone',
      key: 'shipperPhone',
      align: 'center',
      width: 150,
    },
    {
      title: 'Package ID',
      dataIndex: 'packageID',
      key: 'packageID',
      align: 'center',
      width: 150,
    },
    {
      title: 'Tracking No',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      align: 'center',
      width: 150,
    },
    {
      title: 'Reference No',
      dataIndex: 'referenceNoManifest',
      key: 'referenceNoManifest',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee Company',
      dataIndex: 'cneeCompany',
      key: 'cneeCompany',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee Add 1',
      dataIndex: 'cneeAdd1',
      key: 'cneeAdd1',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Add 2',
      dataIndex: 'cneeAdd2',
      key: 'cneeAdd2',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Add 3',
      dataIndex: 'cneeAdd3',
      key: 'cneeAdd3',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Add 4',
      dataIndex: 'cneeAdd4',
      key: 'cneeAdd4',
      align: 'center',
      width: 300,
    },
    {
      title: 'Cnee Tel',
      dataIndex: 'cneeTel',
      key: 'cneeTel',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee Postal Code',
      dataIndex: 'cneePostalCode',
      key: 'cneePostalCode',
      align: 'center',
      width: 150,
    },
    {
      title: 'Cnee name in Katakana',
      dataIndex: 'cneeNameInKatakana',
      key: 'cneeNameInKatakana',
      align: 'center',
      width: 200,
    },
    {
      title: 'GW',
      dataIndex: 'gwManifest',
      key: 'gwManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Unit of Weight',
      dataIndex: 'unitOfWeight',
      key: 'unitOfWeight',
      align: 'center',
      width: 100,
    },
    {
      title: 'Payment Term',
      dataIndex: 'paymentTermManifest',
      key: 'paymentTermManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Freight Charge',
      dataIndex: 'freightChargeManifest',
      key: 'freightChargeManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      align: 'center',
      width: 100,
    },
    {
      title: 'Item Name',
      dataIndex: 'itemNameManifest',
      key: 'itemNameManifest',
      align: 'center',
      width: 120,
    },
    {
      title: ' Origin of Country',
      dataIndex: 'originOfCountry',
      key: 'originOfCountry',
      align: 'center',
      width: 150,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'QTY',
      dataIndex: 'qtyManifest',
      key: 'qtyManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'UOM',
      dataIndex: 'uomManifest',
      key: 'uomManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPriceManifest',
      key: 'unitPriceManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Invoice Cur',
      dataIndex: 'invoiceCurManifest',
      key: 'invoiceCurManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Length',
      dataIndex: 'lengthManifest',
      key: 'lengthManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Width',
      dataIndex: 'widthManifest',
      key: 'widthManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Height',
      dataIndex: 'heightManifest',
      key: 'heightManifest',
      align: 'center',
      width: 100,
    },
    {
      title: 'Length Unit',
      dataIndex: 'lengthUnit',
      key: 'lengthUnit',
      align: 'center',
      width: 100,
    },
    {
      title: 'Insurance',
      dataIndex: 'insurance',
      key: 'insurance',
      align: 'center',
      width: 100,
    },
    {
      title: 'Consignee Japan name',
      dataIndex: 'consigneeNameJapaneseManifest',
      key: 'consigneeNameJapaneseManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Consignee code',
      dataIndex: 'consigneeCodeManifest',
      key: 'consigneeCodeManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Registered company name',
      dataIndex: 'registeredCompanyNameManifest',
      key: 'registeredCompanyNameManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Address',
      dataIndex: 'addressManifest',
      key: 'addressManifest',
      align: 'center',
      width: 250,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      editable: true,
    },
    {
      title: 'Import invoice file',
      key: 'partnerInvoiceFile',
      dataIndex: 'partnerInvoiceFile',
      align: 'center',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      isUploadFile: true,
      render: (text: string, row: any) => {
        return (
          <div>
            <div className='rounded-md bg-slate-200 drop-shadow-md'>
              {row?.isUploadedPartnerInvoiceFile ? 'Uploaded' : 'File'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Xuất bill',
      key: 'id',
      dataIndex: 'id',
      align: 'center',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      render: (text: string, row: any) => {
        return (
          <div>
            <Button
              onClick={() =>
                handleClickFunction.handleGeneratePartnerBill(text)
              }
              type='primary'
              icon={<PrinterOutlined />}
              style={{ marginBottom: '10px', width: '130px' }}
            >
              Tải Bill
            </Button>
            <Button
              onClick={() => handleClickFunction.handleGenerateInvoice(text)}
              type='primary'
              style={{ width: '130px' }}
              icon={<PrinterOutlined />}
              disabled={!row?.isInvoice}
            >
              Tải Invoice
            </Button>
          </div>
        );
      },
    },
  ];
  if (isForPartner) {
    return columnsIsForPartner;
  }

  return columnsManifestYamato;
};
