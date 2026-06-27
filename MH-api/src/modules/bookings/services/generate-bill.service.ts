import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import dayjs from 'dayjs';
import * as fs from 'fs';
import JsBarcode from 'jsbarcode';
import memoryStreams from 'memory-streams';
import { PDFDocument } from 'pdf-lib';
import * as path from 'path';
import puppeteer from 'puppeteer';
import removeAccents from 'remove-accents';
import { commonResponse } from 'src/common/helper/common-response';
import { mappingDataGlobalIntoHTMLFile, mappingDataIntoHTMLFile } from 'src/common/utils/util';
import { acfConfig } from 'src/configs/configs.constants';
import { DOMImplementation, XMLSerializer } from 'xmldom';
import {
  BookingStatus,
  BookingType,
  CommonError,
  countries,
  EPartnerServiceKey,
  ETypeExportBill,
} from '../../../common/constants/common.constants';
import { ICurrencyUnit } from '../../currency-units/interface/currency-units.interface';
import { IDeliveryConditions } from '../../delivery-conditions/interface/delivery-conditions.interface';
import { IService } from '../../services-booking/interface/services.interface';
import { IBooking } from '../interface/bookings.interface';
import { IDataGenerateBill } from '../interface/data-generate-bill.interface';
import { IOptionGenerateBill } from '../interface/option-generate-bill.interface';
import { mappingInvoiceData } from '../utils/mapping';

export class GenerateBillService {
  mapDeliveryConditionName(deliveryCondition: IDeliveryConditions) {
    return deliveryCondition.name.trim().slice(0, 3);
  }

  async combinePDFBuffers(buffers: any[]) {
    if (buffers.length === 1) {
      return buffers[0];
    } else if (!buffers.length) {
      return null;
    }

    const outStream = new memoryStreams.WritableStream();

    try {
      const mergedPdf = await PDFDocument.create();
      for (const buffer of buffers) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      outStream.write(Buffer.from(mergedPdfBytes));
      const newBuffer = outStream.toBuffer();
      outStream.end();

      return newBuffer;
    } catch (e) {
      outStream.end();
      throw new InternalServerErrorException('Error during PDF combination: ' + e.message);
    }
  }

  mappingData(
    booking: IBooking,
    typeGenBill: ETypeExportBill,
    deliveryCondition: IDeliveryConditions,
  ): IDataGenerateBill {
    let mapShippingItem = [];
    let sumPieces;
    let sumWeight;
    let sumWeightCharge;
    const deliveryConditionName = this.mapDeliveryConditionName(deliveryCondition);
    const senderCountry = countries.find((country) => country.key === booking?.senderCountry);
    const receiverCountry = countries.find((country) => country.key === booking?.receiverCountry);
    let mappingDimensions = [];
    const mappingItemDimensions = [];
    if (booking?.bookingDetail) {
      booking.bookingDetail.map((bd) => {
        mapShippingItem.push(bd.shippingItemEn);
      });
      sumPieces = booking.bookingDetail.reduce((partialSum, a) => partialSum + Number(a.quantity), 0).toFixed(0);
      sumWeight = booking.bookingDetail
        .reduce((partialSum, a) => partialSum + Number(a.weight * a.quantity), 0)
        .toFixed(2);
      sumWeightCharge = booking.bookingDetail.reduce(
        (partialSum, a) => partialSum + Number(a.bulkyWeight * a.quantity),
        0,
      );

      mappingDimensions = booking.bookingDetail.map((bd) => {
        mappingItemDimensions.push(`${bd.longs}x${bd.width}x${bd.height}`);
        return {
          value: `${bd.longs}x${bd.width}x${bd.height}`,
          quantity: bd.quantity,
        };
      });
    }
    sumWeightCharge = Math.ceil(Number(sumWeightCharge) * 10) / 10;
    mapShippingItem = [...new Set(mapShippingItem)];
    let htmlDemensions = ``;
    if (mappingDimensions.length) {
      [...new Set(mappingItemDimensions)].map((ele) => {
        htmlDemensions += `<p style="font-size: 16px; font-weight: normal;">${ele} (${mappingDimensions.reduce(
          (count, a) => (a.value === ele ? count + a.quantity : count),
          0,
        )})</p>`;
      });
    }
    const status =
      booking.status === BookingStatus.NOT_YET_HANDED_OVER
        ? `<div
    style="position: absolute; color: red; top: 350px;left:100px;font-size: 40px; font-weight: bold; opacity: 0.7;">
    CHƯA XÁC NHẬN
  </div>`
        : '';

    const senderAddressEn = booking.senderAddressEn || booking.senderAddressVi || '';
    const senderNameEn = booking.senderNameEn || booking.senderNameVi || '';
    const bookingType = booking?.pu_deliveries?.type ?? booking.type;

    return {
      status,
      mapShippingItem: mapShippingItem.join(', '),
      sumPieces,
      sumWeight,
      sumWeightCharge,
      htmlDemensions,
      bookingType: bookingType === BookingType.COMMODITY ? 'NON DOCUMENT' : 'DOCUMENT',
      bookingTypeV2: bookingType === BookingType.COMMODITY ? '(SPX)' : '(DOX)',
      collectCharge: booking?.type_of_payment?.key || '',

      senderPostalCode: booking.senderPostalCode || '',
      senderCountry: this.removeAccent(senderCountry ? senderCountry.value : booking.senderCountry),
      senderProvince: this.removeAccent(booking.senderProvince),
      senderPhoneNumber: booking.senderPhoneNumber || '',
      senderAddressEn: this.removeAccent(senderAddressEn),
      senderNameEn: this.removeAccent(senderNameEn),
      senderContactPerson: this.removeAccent(booking.senderContactPerson),
      senderDepartment: this.removeAccent(booking.senderDepartment),
      senderNote: booking.senderNote || '',
      receiverCountry: this.removeAccent(receiverCountry ? receiverCountry.value : booking.receiverCountry),
      receiverPostalCode: booking.receiverPostalCode || '',
      receiverProvince: this.removeAccent(booking.receiverProvince),
      receiverPhoneNumber: booking.receiverPhoneNumber || '',
      receiverAddress: this.removeAccent(booking.receiverAddress),
      receiverName: this.removeAccent(booking.receiverName),
      receiverContactPerson: this.removeAccent(booking.receiverContactPerson),
      receiverDepartment: this.removeAccent(booking.receiverDepartment),
      receiverNote: booking.receiverNote || '',

      customerCode: booking?.customer?.customerCode || '',
      customsDeclarationNumber: booking.customsDeclarationNumber || '',
      note: booking.note || '',
      deliveryConditionName,
      bookingCode: booking.bookingCode,
      createdDate: dayjs(booking.createdAt).tz('asia/ho_chi_minh').format('DD/MM/YYYY HH:mm:ss'),
    };
  }

  async createBufferPdf(html: string, options = {}, optionGenerateBill: IOptionGenerateBill) {
    let { browser } = optionGenerateBill;
    if (!browser) {
      try {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: acfConfig.pathChrome ? acfConfig.pathChrome : undefined,
          args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--headless'],
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const buffer = await page.pdf(options);
        await page.close();

        return buffer;
      } catch (error) {
        console.log(error);

        throw new InternalServerErrorException(error);
      } finally {
        try {
          await browser?.close();
        } catch (error) {
          console.log(11111, error);
        }
      }
    }

    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.pdf(options);
    await page.close();

    return buffer;
  }

  async generateHtmlBill(booking: IBooking, deliveryCondition: IDeliveryConditions) {
    const {
      htmlDemensions,
      mapShippingItem,
      receiverCountry,
      senderCountry,
      sumPieces,
      sumWeight,
      sumWeightCharge,
      createdDate,
      collectCharge,
    } = this.mappingData(booking, ETypeExportBill.BILL, deliveryCondition);

    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, this.removeAccent(booking.bookingCode), {
      xmlDocument: document,
      font: 'OCR-B',
      width: 3,
    });

    let svgText = xmlSerializer.serializeToString(svgNode);
    svgText = svgText.replace(`width="422px"`, `width="220px"`).replace(`height="142px"`, `height="75px"`);

    let pathfile;
    try {
      pathfile = path.join(__dirname + './../../../../src/modules/bookings/data/mh.html');
    } catch (error) {
      throw new HttpException(CommonError.PARTNER_BILL_NOT_YET_CONFIG, HttpStatus.NOT_FOUND);
    }

    const buffer = fs.readFileSync(pathfile);
    const div = `<div style="min-height: 5px;"></div>`;
    const html = buffer.toString();
    const senderAddress = booking.senderAddressEn || booking.senderAddressVi || '';
    const senderName = booking?.senderNameEn || booking?.senderNameVi || '';

    return mappingDataGlobalIntoHTMLFile(html + div + html, {
      svgText,
      customerCode: booking?.customer?.customerCode || '',
      customsDeclarationNumber: booking.customsDeclarationNumber || '',
      bookingType: booking.type === BookingType.COMMODITY ? 'NON DOCUMENT' : 'DOCUMENT',
      bookingTypeCode: booking.type === BookingType.COMMODITY ? '(SPX)' : '(DOX)',
      senderPostalCode: booking.senderPostalCode || '',

      senderCountry: this.removeAccent(senderCountry),
      receiverPostalCode: booking.receiverPostalCode || '',
      receiverCountry: this.removeAccent(receiverCountry),
      senderProvince: this.removeAccent(booking.senderProvince),
      receiverProvince: this.removeAccent(booking.receiverProvince),
      senderPhoneNumber: this.removeAccent(booking.senderPhoneNumber),
      receiverPhoneNumber: this.removeAccent(booking.receiverPhoneNumber),
      senderAddress: this.removeAccent(senderAddress),
      senderTown: this.removeAccent(booking.senderTown),
      receiverAddress: this.removeAccent(booking.receiverAddress),
      receiverTown: this.removeAccent(booking.receiverTown),
      deliveryCondition: this.mapDeliveryConditionName(deliveryCondition),
      senderName: this.removeAccent(senderName),
      receiverName: this.removeAccent(booking?.receiverName),
      senderContactPerson: this.removeAccent(booking.senderContactPerson),
      senderDepartment: this.removeAccent(booking?.senderDepartment),
      receiverContactPerson: this.removeAccent(booking.receiverContactPerson),
      receiverDepartment: this.removeAccent(booking?.receiverDepartment),
      bookingNote: booking?.note || '',
      senderNote: booking.senderNote || '',
      receiverNote: booking.receiverNote || '',
      htmlDemensions,
      mapShippingItem,
      sumPieces,
      sumWeight,
      sumWeightCharge,
      createdDate,
      collectCharge,
      bookingStatus:
        booking.status === BookingStatus.NOT_YET_HANDED_OVER
          ? `<div
        style="position: absolute; color: red; top: 350px;left:100px;font-size: 40px; font-weight: bold; opacity: 0.7;">
        CHƯA XÁC NHẬN
      </div>`
          : '',
    });
  }

  async generateBill(booking: IBooking, deliveryCondition: IDeliveryConditions) {
    const html = await this.generateHtmlBill(booking, deliveryCondition);
    const options = {
      landscape: false,
      printBackground: true,
      format: 'A4',
      margin: {
        left: '40px',
      },
      scale: 1.2,
    };

    return this.createBufferPdf(html, options, {});
  }

  async getHtmlPartnerBill(partnerService: IService) {
    if (!partnerService) {
      throw new HttpException(commonResponse(CommonError.NOT_FOUND_PARTNER_SERVICE, null), HttpStatus.BAD_REQUEST);
    }
    if (!partnerService.htmlTemplate) {
      console.log(partnerService)
      throw new HttpException(CommonError.PARTNER_BILL_NOT_YET_CONFIG, HttpStatus.NOT_FOUND);
    }

    let pathfile;
    try {
      pathfile = path.join(__dirname + './../../../../src/modules/bookings/data/' + partnerService.htmlTemplate);
    } catch (error) {
      throw new HttpException(CommonError.PARTNER_BILL_NOT_YET_CONFIG, HttpStatus.NOT_FOUND);
    }

    const buffer = fs.readFileSync(pathfile);
    return buffer.toString();
  }

  async generatePartnerBillV2(booking: IBooking, deliveryCondition: IDeliveryConditions) {
    const data = this.mappingData(booking, ETypeExportBill.PARTNER, deliveryCondition);
    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, this.removeAccent(booking.partnerBillCode), {
      xmlDocument: document,
      font: 'OCR-B',
      width: 4,
    });

    let svgText = xmlSerializer.serializeToString(svgNode);
    const svgTextArr = svgText.split(`"`);
    svgTextArr[1] = '200px';
    svgTextArr[3] = '60px';
    svgText = svgTextArr.join(`"`);

    let html: string = await this.getHtmlPartnerBill(booking.service);
    html = mappingDataIntoHTMLFile(html, { ...data, svgText });

    const div = `<div style="min-height: 2px;"></div>`;

    return [EPartnerServiceKey.YAMATO, EPartnerServiceKey.YAMATO_SOUTHERN, EPartnerServiceKey.K_CARGO].includes(
      booking.service.key as EPartnerServiceKey,
    )
      ? html
      : html + div + html;
  }

  getOptionGeneratePDF(partnerService: IService) {
    if (
      partnerService &&
      [EPartnerServiceKey.YAMATO, EPartnerServiceKey.YAMATO_SOUTHERN, EPartnerServiceKey.K_CARGO].includes(
        partnerService.key as EPartnerServiceKey,
      )
    ) {
      return {
        landscape: false,
        printBackground: true,
        format: 'A6',
        margin: {
          top: '15px',
          left: '12px',
        },
        scale: 1.3,
      };
    }

    return {
      landscape: false,
      printBackground: true,
      format: 'A4',
      margin: {
        left: '40px',
      },
      scale: 1.2,
    };
  }

  async generatePartnerBill(
    booking: IBooking,
    deliveryCondition: IDeliveryConditions,
    optionGenerateBill: IOptionGenerateBill,
  ) {
    const html = await this.generatePartnerBillV2(booking, deliveryCondition);

    return this.createBufferPdf(html, this.getOptionGeneratePDF(booking.service), optionGenerateBill);
  }

  async generateBillInvoice(booking: IBooking, deliveryCondition: IDeliveryConditions, currencyUnit: ICurrencyUnit) {
    const html = await this.generateHtmlBillInvoice(booking, deliveryCondition, currencyUnit);
    const options = {
      landscape: false,
      printBackground: true,
      format: 'A4',
      margin: {
        top: '5px',
        right: '0px',
        bottom: '5px',
        left: '20px',
      },
      scale: 1.3,
    };

    return this.createBufferPdf(html, options, {});
  }

  async generateHtmlBillInvoice(
    booking: IBooking,
    deliveryCondition: IDeliveryConditions,
    currencyUnit: ICurrencyUnit,
  ) {
    const data = mappingInvoiceData(booking, deliveryCondition, currencyUnit);

    let pathfile;
    try {
      pathfile = path.join(__dirname + './../../../../src/modules/bookings/data/template_invoice.html');
    } catch (error) {
      throw new HttpException(CommonError.TEMPLATE_INVOICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const buffer = fs.readFileSync(pathfile);
    let html = buffer.toString();
    html = mappingDataGlobalIntoHTMLFile(html, data);

    return html;
  }

  async generatePartnerBillInvoice(
    booking: IBooking,
    netAndVolumneWeight: any,
    deliveryCondition: IDeliveryConditions,
    currencyUnit: ICurrencyUnit,
    optionGenerateBill: IOptionGenerateBill,
  ) {
    const html = await this.generateHTMLPartnerBillInvoice(
      booking,
      netAndVolumneWeight,
      deliveryCondition,
      currencyUnit,
    );

    const options = {
      landscape: false,
      printBackground: true,
      format: 'A4',
      margin: {
        top: '5px',
        right: '0px',
        bottom: '5px',
        left: '20px',
      },
      scale: 1.3,
    };

    return this.createBufferPdf(html, options, optionGenerateBill);
  }

  async generateHTMLPartnerBillInvoice(
    booking: IBooking,
    netAndVolumneWeight: any,
    deliveryCondition: IDeliveryConditions,
    currencyUnit: ICurrencyUnit,
  ) {
    const invoice = booking.invoice;
    const invoiceDetail = invoice?.invoice_detail || [];
    const currencyUnitCode = currencyUnit.name.split('-')[0].trim();

    let mappingDimensions = [];
    const mappingItemDimensions = [];
    if (booking?.bookingDetail) {
      mappingDimensions = booking.bookingDetail.map((bd) => {
        mappingItemDimensions.push(`${bd.longs}x${bd.width}x${bd.height}`);
        return {
          value: `${bd.longs}x${bd.width}x${bd.height}`,
          quantity: bd.quantity,
        };
      });
    }
    const htmlDemensions = [];
    if (mappingDimensions.length) {
      [...new Set(mappingItemDimensions)].map((ele) => {
        htmlDemensions.push(
          `${ele} (${mappingDimensions.reduce((count, a) => (a.value === ele ? count + a.quantity : count), 0)})`,
        );
      });
    }

    let htmlShowListInvoiceDetail = ``;
    let totalItem = 0;
    let amount = 0;
    for (let i = 0; i < invoiceDetail.length; i++) {
      const originCountry = countries.find((country) => country.key === invoiceDetail[i].originOfGoods);
      totalItem += Number(invoiceDetail[i]?.quantity) || 0;
      amount += invoiceDetail[i]?.quantity * invoiceDetail[i]?.price || 0;
      htmlShowListInvoiceDetail += `
      <tr>
        <td style="height: 22px;">${i + 1}</td>
        <td>${invoiceDetail[i].goodsName || ''}</td>
        <td>${invoiceDetail[i].unitOfMeasure || ''}</td>
        <td>${invoiceDetail[i].describe || ''}</td>
        <td>${invoiceDetail[i].HSCode || ''}</td>
        <td>${originCountry ? originCountry.value : invoiceDetail[i].originOfGoods || ''}</td>
        <td>${Number(invoiceDetail[i]?.quantity).toFixed(2) || 0}</td>
        <td>${
          Number(invoiceDetail[i]?.price)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0,00'
        }</td>
        <td>${Number(invoiceDetail[i]?.quantity * invoiceDetail[i]?.price || 0)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
      </tr>
      `;
    }
    const sumWeight = booking.bookingDetail
    .reduce((partialSum, a) => partialSum + Number(a.weight * a.quantity), 0)
    .toFixed(2);
    const sumWeightCharge = (Math.ceil(Number(booking.bookingDetail.reduce( (partialSum, a) => partialSum + Number(a.bulkyWeight * a.quantity), 0)) * 10) / 10).toFixed(2);

    const html = `
    <html>

<head>
  <style>
    th,
    td {
      border-top-style: solid;
      border: 1px solid black;
      font-size: 10px;
      font-weight: bold;
      text-align: center;
      padding: 0;
      margin: 0;
    }

    table {
      border-spacing: 0px;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      text-align: center;
      width: 555px;
    }

    .title {
      font-size: 42px;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>

<body>
  <p class="title">INVOICE</p>
  <table style="width: 555px;">
    <tr>
      <th style="width: 83px;font-size: 11px;height: 26px;border-right: none">INVOICE NO</th>
      <th style="width: 83px;font-size: 11px;height: 26px;border-right: none">DATE</th>
      <th style="width: 83px;font-size: 11px;height: 26px;border-right: none">ACCOUNT</th>
      <th style="width: 130px;font-size: 11px;height: 26px;border-right: none">BILL NUMBER</th>
      <th rowspan="2" style="width: 170px;font-size: 11px;height: 26px;">${invoice?.invoiceType || ''}</th>
    </tr>
    <tr>
      <td style="width: 110px;font-size: 11px;height: 26px;border-top: none;border-right: none">${
        invoice?.invoiceNumber || ''
      }</td>
      <td style="width: 100px;font-size: 11px;height: 26px;border-top: none;border-right: none">${
        invoice?.invoiceDate ? dayjs(invoice?.invoiceDate).format('DD/MM/YYYY') : ''
      }</td>
      <td style="width: 120px;font-size: 11px;height: 26px;border-top: none;border-right: none">
        ${booking.customer.customerCode}</td>
      <td style="width: 170px;font-size: 11px;height: 26px;border-top: none;border-right: none;">${
        booking?.partnerBillCode || ''
      }</td>
    </tr>

    <tr>
      <td colspan="5" style="height: 15px;border: none;"></td>
    </tr>

    <tr>
      <th colspan="5" style="border-bottom: none;">
        <div style="display: flex; flex-direction: row;">
          <div
            style="width: 50%; font-size: 12px;height: 20px;display: flex;flex-direction: row;justify-content: center;align-items: center;">
            SHIPPER / EXPORTER</div>
          <div
            style="width: 50%; font-size: 12px;height: 20px;display: flex;flex-direction: row;justify-content: center;align-items: center;border-left: 1px solid black">
            CONSIGNEE/ DELIVERY TO</div>
        </div>
      </th>
    </tr>

    <tr>
      <td colspan="5">
        <div style="display: flex;flex-direction: row;">
          <div style="width: 50%;">
            <p style="padding-left: 2pt;text-indent: 0pt;line-height:
              11pt;text-align: left;">Company: <span class="s1">${removeAccents(
                booking?.senderNameEn || booking?.senderNameVi,
              )}</span>
            </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">Address:
              <span class="s1">${removeAccents(booking?.senderAddressEn || '')}</span><br />
              <span class="s1">${removeAccents(booking?.senderTown || '')}</span><br />
              <span class="s1">${removeAccents(booking?.senderProvince || '')}</span><br />
              <span class="s1">${removeAccents(booking?.senderCountry || '')}</span><br />

            </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">PostCode:
              <span class="s1">${booking?.senderPostalCode || ''}</span>
            </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">Name:
              <span class="s1">${removeAccents(booking?.senderContactPerson || '')}</span>
            </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">Tel: <span class="s1"> ${
                booking?.senderPhoneNumber || ''
              }</span></p>
          </div>


          <div style="width: 50%;border-left:1px solid black ;">
            <p style="padding-left: 2pt;text-indent: 0pt;line-height:
              11pt;text-align: left;">Company: <span class="s1">${removeAccents(booking?.receiverName || '')}</span></p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">Address:
              <span class="s1">${removeAccents(booking.receiverAddress || '')}</span> <br />
              <span class="s1">${removeAccents(booking.receiverTown || '')}</span> <br />
              <span class="s1">${removeAccents(booking.receiverProvince || '')}</span> <br />
              <span class="s1">${removeAccents(booking.receiverCountry || '')}</span> <br />

              </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">PostCode:
              <span class="s1">${booking?.receiverPostalCode || ''}</span>
            </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">Name:
              <span class="s1"> ${removeAccents(booking?.receiverContactPerson || '')}</span>
            </p>
            <p style="margin-top: 20px; padding-left: 2pt;text-indent:
              0pt;line-height: 11pt;text-align: left;">Tel: <span class="s1">${
                booking?.receiverPhoneNumber || ''
              }</span></p>
          </div>
        </div>
      </td>

    </tr>
    <tr>
      <td colspan="5" style="border: none;">

        <p style="
            text-decoration: underline;
            font-size: 13px;
            text-align: left;
            font-weight: bold;
            margin-top: 12px;

            ">
          IMPORTER <br />
        </p>
        <p style="text-align: left;padding-left: 50px;font-weight: 400;font-size: 16px; ">${
          invoice?.importers || 'Same as Consignee'
        }</p>

      </td>
    </tr>

  </table>

  <div style="width: 100%;">

  </div>
  <div style="margin-top: 12px; width: 100%;">

    <table style="width: 555px;">
      <tr>
        <th style="width: 40px;height: 37px;font-size: 10px;">STT</th>
        <th style="width: 180px;font-size: 10px;">DESCRIPTION</th>
        <th style="width: 60px;font-size: 10px;">UNIT</th>
        <th style="width: 80px;font-size: 10px;">MATERIAL</th>
        <th style="width: 70px;font-size: 10px;">HS CODE</th>
        <th style="width: 60px;font-size: 10px;">ORIGIN</th>
        <th style="width: 70px;font-size: 10px;">QUANTILY</th>
        <th style="width: 80px;font-size: 10px;">UNITPRICE (CIF-${currencyUnitCode})</th>
        <th style="width: 80px;font-size: 10px;">AMOUNT (${currencyUnitCode})</th>
      </tr>

      ${htmlShowListInvoiceDetail}

      <tr>
        <td style="height: 22px;"></td>
        <td style="font-weight: bold">Total</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${totalItem.toFixed(2)}</td>
        <td></td>
        <td>${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
      </tr>
    </table>
  </div>
  <div style="margin-top: 25px; width: 100%;">
    <table style="width: 100%">
      <tr>
        <th style="font-size: 14px; text-align: left;height: 25px;font-size: 10px;">
          <p style="font-weight: bold">
            DELIVERY TERM: <span style="font-weight: normal">${await this.mapDeliveryConditionName(
              deliveryCondition,
            )}</span>
          </p>
        </th>
        <th style="font-size: 14px; text-align: left;font-size: 10px;">
          <p style="font-weight: bold">
            Number of packages:
            <span style="font-weight: normal; text-align: center">${invoice.totalBaleNumber || 0} </span>
          </p>
        </th>
      </tr>
      <tr>
        <td style="font-size: 14px; text-align: left;height: 25px;font-size: 10px;">
          <p style="font-weight: bold">
            Net Weight: <span style="font-weight: normal">${sumWeight}</span>
          </p>
        </td>
        <td style="font-size: 14px; text-align: left;font-size: 10px;">
          <p style="font-weight: bold">
            VOLUME WEIGHT:
            <span style="font-weight: normal; text-align: center">${sumWeightCharge}</span>
          </p>
        </td>
      </tr>

      <tr>
        <td style="font-size: 14px; text-align: left;height: 25px;font-size: 10px;">
          <p style="font-weight: bold">
            REASON FOR EXPORT:
            <span style="font-weight: normal">${invoice?.reasonExport || ''}</span>
          </p>
        </td>
        <td style="font-size: 14px; text-align: left;font-size: 10px;">
          <p style="font-weight: bold">
            DIMENSION:
            <span style="font-weight: normal; text-align: center">${
              invoice.isAdditional ? invoice.goodsSize : htmlDemensions.join(', ') || ''
            }</span>
          </p>
        </td>
      </tr>
    </table>

  </div>
  <div style="margin-top: 23px;">
    <p style="text-align: left;font-size: 8px;font-weight: bold;">
      Note:<span>..........................................</span></p>
  </div>
  <div style="display: flex;flex-direction: row; align-items: center;justify-content:space-between;">
    <p style="font-size: 8;text-align: left;width:50% ;font-weight: bold;">COMPANY STAMP </p>
    <p style="font-size: 8;text-align: left;width:50% ;font-weight: bold">SIGNATURE</p>
  </div>
</body>

</html>
    `;

    return html;
  }

  async generateListSmallBillV2(bookings: IBooking[], deliveryCondition: IDeliveryConditions) {
    const data = [];
    for (let i = 0; i < bookings.length; i++) {
      const result = await this.generateHtmlSmallBill(bookings[i], deliveryCondition);
      data.push(result);
    }

    return data;
  }

  async generateListSmallBill(bookings: IBooking[], deliveryCondition: IDeliveryConditions) {
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: acfConfig.pathChrome ? acfConfig.pathChrome : undefined,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--headless'],
      });

      const data = [];
      for (let i = 0; i < bookings.length; i++) {
        const result = await this.generateSmallBill(bookings[i], deliveryCondition, browser);
        data.push(result);
      }

      return this.combinePDFBuffers(data);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    } finally {
      try {
        await browser?.close();
      } catch (error) {
        console.log(11111, error);
      }
    }
  }

  async generateHtmlSmallBill(booking: IBooking, deliveryCondition: IDeliveryConditions) {
    const { mapShippingItem, receiverCountry, senderCountry, sumPieces } = await this.mappingData(
      booking,
      ETypeExportBill.SMALL_BILL,
      deliveryCondition,
    );

    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, this.removeAccent(booking.bookingCode), {
      xmlDocument: document,
      font: 'OCR-B',
    });

    let svgText = xmlSerializer.serializeToString(svgNode);
    svgText = svgText.replace(`width="288px"`, `width="160px"`).replace(`height="142px"`, `height="75px"`);

    const html = `
      <html>
      
      <head>
        <style>
          th,
          td {
            border-top-style: solid;
            border: 0.5px solid black;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding: 0;
            margin: 0;
          }
      
          table {
            border-spacing: 0px;
          }
      
          body {
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            width: 298px;
          }
      
          p {
            margin: 0px;
            padding: 0px;
          }
      
          .title {
            font-size: 42px;
            font-weight: bold;
            text-align: center;
          }
        </style>
      </head>
      
      <body>
        <div>
          <table style="width: 298px">
            <tr>
              <th style="
                padding: 0px;
                display: flex;
                flex-direction: row;
                gap: 4px;
                align-items: center;
                justify-content: center;
                border-bottom: none;
              " colspan="2">
                <!-- Image -->
                <img
                  src="data:image/png;base64,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"
                  style="width: 84px; height: 34px" />
                <!-- End Image  -->
      
                <!-- BarCode  -->
                ${svgText}
      
                <!-- End BarCode  -->
              </th>
            </tr>
            <tr>
              <td style="padding: 0px; margin: 0px">
                <div style="width: full; display: flex; flex-direction: row">
                  <div style="
                    width: 18px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  ">
                    <p style="
                      writing-mode: vertical-rl;
                      font-size: 15px;
                      transform: rotate(180deg);
                    ">
                      FROM (SHIPPER)
                    </p>
                  </div>
                  <div style="width: 183px">
                    <table>
                      <tr>
                        <th style="
                          width: 77px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                          border-top: none;
                        ">
                          POSTAL CODE
                        </th>
                        <th style="
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          border-bottom: none;
                          border-top: none;
                        ">
                          COUNTRY
                        </th>
                      </tr>
                      <tr>
                        <td style="
                          width: 73px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                        ">
                          ${booking.senderPostalCode || ''}
                        </td>
                        <td style="
                          width: 105px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          padding: 0px;
                          margin: 0px;
                          border-bottom: none;
                        ">
                          ${senderCountry}
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                          border-right: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              CITY
                            </div>
                            <div style="
                              width: 105px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              ${booking.senderProvince || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          font-size: 12px;
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 100%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                              font-size: 6px;
                            ">
                              TEL NO
                            </div>
                            <div style="width: 105px; font-size: 6px">
                              ${booking?.senderPhoneNumber || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: none">
                          <div style="height: 30px; border-bottom: none">
                            <p style="
                              font-size: 6px;
                              width: 45px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              ADDRESS:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking?.senderAddressEn || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="margin: 0px; padding: 0px; border-bottom: none" colspan="2">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              COMPANY:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.senderNameEn || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              padding: 2px 3px;
                              text-align: left;
                            ">
                              NAME:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.senderContactPerson || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 26px; text-align: left">
                            <p style="
                              font-size: 6px;
                              width: 50px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              SHIPPER'SREPERENCE
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.senderNote || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
      
                  <div style="margin-left: 2px; width: 100px">
                    <div style="height: 30px; border-bottom: 0.5px solid black">
                      <p style="font-size: 6px; width: 100%; font-weight: bold; text-align: left; padding: 3px 0 0 4px;">
                        ACCOUNT:
                      </p>
                      <p style="
                        width: 100%;
                        font-size: 8px;
                        font-weight: bold;
                        text-align: center;
                        margin-top: 2px;
                      ">
                        ${booking?.customer?.customerCode || ''}
                      </p>
                    </div>
      
                    <div style="
                      height: 30px;
                      border-bottom: 0.5px solid black;
                      border-top: none;
                      font-size: 10px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      flex-direction: column;
                    ">
                      <p style="padding: 0px; margin: 0px">${
                        booking.type === BookingType.COMMODITY ? 'NON DOCUMENT' : 'DOCUMENT'
                      }</p>
                      <p style="padding: 0px; margin: 0px">${
                        booking.type === BookingType.COMMODITY ? '(SPX)' : '(DOX)'
                      }</p>
                    </div>
      
                    <div style="
                      height: 12px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      font-weight: bold;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      PIECES
                    </div>
      
                    <div style="
                      height: 17px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                    ">
                      ${sumPieces}
                    </div>
      
                    <div style="
                      height: 23px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      font-weight: bold;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      NET WEIGHT
                    </div>
      
                    <div style="
                      height: 23px;
                      border-bottom: 0.5px solid black;
                      font-size: 8px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
      
                    </div>
      
                    <div style="
                      height: 26px;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                      border-top: none;
                    ">
                      WEGHT CHARGE
                    </div>
                  </div>
                </div>
              </td>
            </tr>
      
            <tr>
              <td style="border-bottom: none; border-top: none">
                <div style="flex-direction: row; display: flex">
                  <div style="width: 202px; height: 26px">
                    <p style="
                      font-size: 6px;
                      text-align: left;
                      font-weight: bold;
                      margin: 0;
                      padding: 2px 3px;
                    ">
                      DESCRIPTION OF GOODS:
                    </p>
                    <p style="
                      width: 100%;
                      text-align: center;
                      font-size: 11px;
                      font-weight: bold;
                      margin-top: 5px;
                      margin: 0;
                      padding: 0;
                    ">
                      ${mapShippingItem}
                    </p>
                  </div>
                  <div style="
                    width: 90px;
                    font-weight: bold;
                    border-left: 0.5px solid black;
                    height: 26px;
                    display: flex;
                    flex-direction: row;
                    font-size: 8px;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    padding: 0;
                  ">
      
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 0px; margin: 0px">
                <div style="width: full; display: flex; flex-direction: row">
                  <div style="
                    width: 18px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  ">
                    <p style="
                      writing-mode: vertical-rl;
                      font-size: 15px;
                      transform: rotate(180deg);
                    ">
                      TO ( CONSIGNEE)
                    </p>
                  </div>
      
                  <div style="width: 183px">
                    <table>
                      <tr>
                        <th style="
                          width: 77px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                          border-top: none;
                        ">
                          POSTAL CODE
                        </th>
                        <th style="
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          border-bottom: none;
                          border-top: none;
                        ">
                          COUNTRY
                        </th>
                      </tr>
                      <tr>
                        <td style="
                          width: 73px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                        ">
                          ${booking?.receiverPostalCode || ''}
                        </td>
                        <td style="
                          width: 105px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          padding: 0px;
                          margin: 0px;
                          border-bottom: none;
                        ">
                          ${receiverCountry}
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                          border-right: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              CITY
                            </div>
                            <div style="
                              width: 105px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              ${booking.receiverProvince || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          font-size: 12px;
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 100%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                              font-size: 6px;
                            ">
                              TEL NO
                            </div>
                            <div style="width: 105px; font-size: 6px">
                              ${booking?.receiverPhoneNumber || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: none">
                          <div style="height: 30px; border-bottom: none">
                            <p style="
                              font-size: 6px;
                              width: 45px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              ADDRESS:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverAddress || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="margin: 0px; padding: 0px; border-bottom: none" colspan="2">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              COMPANY:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverName || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              padding: 2px 3px;
                              text-align: left;
                            ">
                              NAME:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverContactPerson || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 26px; text-align: left">
                            <p style="
                              font-size: 6px;
                              width: 150px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              OTHER: (SPECAIL INSTRUCTION)
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverNote || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
      
                  <div style="margin-left: 2px; width: 100px">
                    <div style="
                      width: 100%;
                      height: 15px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    ">
                      <p>DELIVERY TERM</p>
                    </div>
      
                    <div style="
                      width: 100%;
                      height: 14px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    ">
                      <p>${await this.mapDeliveryConditionName(deliveryCondition)}</p>
                    </div>
      
                    <div style="
                      width: 100%;
                      height: 15px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    ">
                      <p>COLIECT CHARGE</p>
                    </div>
      
                    <div style="
                      width: 100%;
                      height: 14px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    "></div>
      
                    <div style="
                      height: 14px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      DIMENSIONS
                    </div>
      
                    <div style="
                      height: 38.5px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
      
                    </div>
                    <div style="
                      height: 23px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      CONSIGNEE'S SIGNATURE
                    </div>
                    <div style="
                      height: 25px;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: end;
                      justify-content: flex-end;
                      padding-right: 2px;
                    ">${booking?.parentBooking || ''}</div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
      
      
        </div>
      </body>
      
      </html>
      `;

    return html;
  }

  async generateSmallBill(booking: IBooking, deliveryCondition: IDeliveryConditions, browser: any) {
    const { htmlDemensions, mapShippingItem, receiverCountry, senderCountry, sumPieces, sumWeight, sumWeightCharge } =
      await this.mappingData(booking, ETypeExportBill.SMALL_BILL, deliveryCondition);

    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, this.removeAccent(booking.bookingCode), {
      xmlDocument: document,
      font: 'OCR-B',
    });

    let svgText = xmlSerializer.serializeToString(svgNode);
    svgText = svgText.replace(`width="288px"`, `width="160px"`).replace(`height="142px"`, `height="75px"`);

    const html = `
      <html>
      
      <head>
        <style>
          th,
          td {
            border-top-style: solid;
            border: 0.5px solid black;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding: 0;
            margin: 0;
          }
      
          table {
            border-spacing: 0px;
          }
      
          body {
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            width: 298px;
          }
      
          p {
            margin: 0px;
            padding: 0px;
          }
      
          .title {
            font-size: 42px;
            font-weight: bold;
            text-align: center;
          }
        </style>
      </head>
      
      <body>
        <div>
          <table style="width: 298px">
            <tr>
              <th style="
                padding: 0px;
                display: flex;
                flex-direction: row;
                gap: 4px;
                align-items: center;
                justify-content: center;
                border-bottom: none;
              " colspan="2">
                <!-- Image -->
                <img
                  src="data:image/png;base64,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"
                  style="width: 100px; height: auto" />
                <!-- End Image  -->
      
                <!-- BarCode  -->
                ${svgText}
      
                <!-- End BarCode  -->
              </th>
            </tr>
            <tr>
              <td style="padding: 0px; margin: 0px">
                <div style="width: full; display: flex; flex-direction: row">
                  <div style="
                    width: 18px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  ">
                    <p style="
                      writing-mode: vertical-rl;
                      font-size: 15px;
                      transform: rotate(180deg);
                    ">
                      FROM (SHIPPER)
                    </p>
                  </div>
                  <div style="width: 183px">
                    <table>
                      <tr>
                        <th style="
                          width: 77px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                          border-top: none;
                        ">
                          POSTAL CODE
                        </th>
                        <th style="
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          border-bottom: none;
                          border-top: none;
                        ">
                          COUNTRY
                        </th>
                      </tr>
                      <tr>
                        <td style="
                          width: 73px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                        ">
                          ${booking.senderPostalCode || ''}
                        </td>
                        <td style="
                          width: 105px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          padding: 0px;
                          margin: 0px;
                          border-bottom: none;
                        ">
                          ${senderCountry}
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                          border-right: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              CITY
                            </div>
                            <div style="
                              width: 105px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              ${booking.senderProvince || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          font-size: 12px;
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 100%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                              font-size: 6px;
                            ">
                              TEL NO
                            </div>
                            <div style="width: 105px; font-size: 6px">
                              ${booking?.senderPhoneNumber || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: none">
                          <div style="height: 30px; border-bottom: none">
                            <p style="
                              font-size: 6px;
                              width: 45px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              ADDRESS:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking?.senderAddressEn || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="margin: 0px; padding: 0px; border-bottom: none" colspan="2">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              COMPANY:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.senderNameEn || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              padding: 2px 3px;
                              text-align: left;
                            ">
                              NAME:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.senderContactPerson || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 26px; text-align: left">
                            <p style="
                              font-size: 6px;
                              width: 50px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              SHIPPER'SREPERENCE
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.senderNote || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
      
                  <div style="margin-left: 2px; width: 100px">
                    <div style="height: 30px; border-bottom: 0.5px solid black">
                      <p style="font-size: 6px; width: 100%; font-weight: bold; text-align: left; padding: 3px 0 0 4px;">
                        ACCOUNT:
                      </p>
                      <p style="
                        width: 100%;
                        font-size: 8px;
                        font-weight: bold;
                        text-align: center;
                        margin-top: 2px;
                      ">
                        ${booking?.customer?.customerCode || ''}
                      </p>
                    </div>
      
                    <div style="
                      height: 30px;
                      border-bottom: 0.5px solid black;
                      border-top: none;
                      font-size: 10px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      flex-direction: column;
                    ">
                      <p style="padding: 0px; margin: 0px">${
                        booking.type === BookingType.COMMODITY ? 'NON DOCUMENT' : 'DOCUMENT'
                      }</p>
                      <p style="padding: 0px; margin: 0px">${
                        booking.type === BookingType.COMMODITY ? '(SPX)' : '(DOX)'
                      }</p>
                    </div>
      
                    <div style="
                      height: 12px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      font-weight: bold;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      PIECES
                    </div>
      
                    <div style="
                      height: 17px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                    ">
                      ${sumPieces}
                    </div>
      
                    <div style="
                      height: 23px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      font-weight: bold;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      NET WEIGHT
                    </div>
      
                    <div style="
                      height: 23px;
                      border-bottom: 0.5px solid black;
                      font-size: 8px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
      
                    </div>
      
                    <div style="
                      height: 26px;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                      border-top: none;
                    ">
                      WEGHT CHARGE
                    </div>
                  </div>
                </div>
              </td>
            </tr>
      
            <tr>
              <td style="border-bottom: none; border-top: none">
                <div style="flex-direction: row; display: flex">
                  <div style="width: 202px; height: 26px">
                    <p style="
                      font-size: 6px;
                      text-align: left;
                      font-weight: bold;
                      margin: 0;
                      padding: 2px 3px;
                    ">
                      DESCRIPTION OF GOODS:
                    </p>
                    <p style="
                      width: 100%;
                      text-align: center;
                      font-size: 11px;
                      font-weight: bold;
                      margin-top: 5px;
                      margin: 0;
                      padding: 0;
                    ">
                      ${mapShippingItem}
                    </p>
                  </div>
                  <div style="
                    width: 90px;
                    font-weight: bold;
                    border-left: 0.5px solid black;
                    height: 26px;
                    display: flex;
                    flex-direction: row;
                    font-size: 8px;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    padding: 0;
                  ">
      
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 0px; margin: 0px">
                <div style="width: full; display: flex; flex-direction: row">
                  <div style="
                    width: 18px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  ">
                    <p style="
                      writing-mode: vertical-rl;
                      font-size: 15px;
                      transform: rotate(180deg);
                    ">
                      TO ( CONSIGNEE)
                    </p>
                  </div>
      
                  <div style="width: 183px">
                    <table>
                      <tr>
                        <th style="
                          width: 77px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                          border-top: none;
                        ">
                          POSTAL CODE
                        </th>
                        <th style="
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          border-bottom: none;
                          border-top: none;
                        ">
                          COUNTRY
                        </th>
                      </tr>
                      <tr>
                        <td style="
                          width: 73px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-bottom: none;
                        ">
                          ${booking?.receiverPostalCode || ''}
                        </td>
                        <td style="
                          width: 105px;
                          height: 15px;
                          font-size: 6px;
                          font-weight: bold;
                          border-left: none;
                          padding: 0px;
                          margin: 0px;
                          border-bottom: none;
                        ">
                          ${receiverCountry}
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                          border-right: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              CITY
                            </div>
                            <div style="
                              width: 105px;
                              height: 15px;
                              font-size: 6px;
                              font-weight: bold;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                            ">
                              ${booking.receiverProvince || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="
                          font-size: 12px;
                          padding: 0px;
                          height: 15px;
                          border-bottom: none;
                        " colspan="2">
                          <div style="
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            height: 100%;
                          ">
                            <div style="
                              width: 77px;
                              height: 100%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-right: 0.5px solid black;
                              font-size: 6px;
                            ">
                              TEL NO
                            </div>
                            <div style="width: 105px; font-size: 6px">
                              ${booking?.receiverPhoneNumber || ''}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: none">
                          <div style="height: 30px; border-bottom: none">
                            <p style="
                              font-size: 6px;
                              width: 45px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              ADDRESS:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverAddress || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td style="margin: 0px; padding: 0px; border-bottom: none" colspan="2">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              COMPANY:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverName || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
      
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 23px">
                            <p style="
                              font-size: 6px;
                              width: 40px;
                              font-weight: bold;
                              padding: 2px 3px;
                              text-align: left;
                            ">
                              NAME:
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverContactPerson || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="margin: 0px; padding: 0px; border-bottom: none">
                          <div style="height: 26px; text-align: left">
                            <p style="
                              font-size: 6px;
                              width: 150px;
                              font-weight: bold;
                              text-align: left;
                              padding: 2px 3px;
                            ">
                              OTHER: (SPECAIL INSTRUCTION)
                            </p>
                            <p style="
                              width: 100%;
                              text-align: center;
                              font-size: 6px;
                            ">
                              ${booking.receiverNote || ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
      
                  <div style="margin-left: 2px; width: 100px">
                    <div style="
                      width: 100%;
                      height: 15px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    ">
                      <p>DELIVERY TERM</p>
                    </div>
      
                    <div style="
                      width: 100%;
                      height: 14px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    ">
                      <p>${await this.mapDeliveryConditionName(deliveryCondition)}</p>
                    </div>
      
                    <div style="
                      width: 100%;
                      height: 15px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    ">
                      <p>COLIECT CHARGE</p>
                    </div>
      
                    <div style="
                      width: 100%;
                      height: 14px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      flex-direction: row;
                      align-items: center;
                      font-weight: bold;
                      justify-content: center;
                      display: flex;
                    "></div>
      
                    <div style="
                      height: 14px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      DIMENSIONS
                    </div>
      
                    <div style="
                      height: 38.5px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
      
                    </div>
                    <div style="
                      height: 23px;
                      border-bottom: 0.5px solid black;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                    ">
                      CONSIGNEE'S SIGNATURE
                    </div>
                    <div style="
                      height: 25px;
                      font-size: 6px;
                      display: flex;
                      flex-direction: row;
                      align-items: end;
                      justify-content: flex-end;
                      padding-right: 2px;
                    ">${booking?.parentBooking || ''}</div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
      
      
        </div>
      </body>
      
      </html>
      `;
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.pdf({
      landscape: false,
      printBackground: true,
      format: 'A6',
      margin: {
        left: '20px',
        top: '30px',
      },
      scale: 1.1,
      displayHeaderFooter: false,
    });
    await page.close();

    return buffer;
  }

  async generateListSplitBooking(bookings: IBooking[], deliveryCondition: IDeliveryConditions) {
    const buffers = [];
    for (let i = 0; i < bookings.length; i++) {
      const result = await this.generatePartnerBill(bookings[i], deliveryCondition, {});
      buffers.push(result);
    }

    return this.combinePDFBuffers(buffers);
  }

  async generateCargoListFile(html: string) {
    const options = {
      landscape: false,
      printBackground: true,
      format: 'A4',
      margin: {},
      scale: 1.2,
    };

    return this.createBufferPdf(html, options, {});
  }

  private removeAccent(str = '') {
    if (!str) return '';
    return removeAccents(str);
  }
}
