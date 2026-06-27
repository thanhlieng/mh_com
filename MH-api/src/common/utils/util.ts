import { appConfig } from 'src/configs/configs.constants';
import { DayJS } from './dayjs';

export const mappingDataIntoHTMLFile = (html: string, data: object) => {
  const listKeys = Object.keys(data);
  for (let i = 0; i < listKeys.length; i++) {
    html = html.replace(`{{${listKeys[i]}}}`, data[listKeys[i]]);
  }

  return html;
};

export const mappingDataGlobalIntoHTMLFile = (html: string, data: object) => {
  const listKeys = Object.keys(data);
  for (let i = 0; i < listKeys.length; i++) {
    const regex = new RegExp(`{{${listKeys[i]}}}`, 'g');
    html = html.replace(regex, data[listKeys[i]]);
  }

  return html;
};

export const removeAccents = (str: string) => {
  if (!str || str == null) return null;

  var AccentsMap = [
    'aàảãáạăằẳẵắặâầẩẫấậ',
    'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
    'dđ',
    'DĐ',
    'eèẻẽéẹêềểễếệ',
    'EÈẺẼÉẸÊỀỂỄẾỆ',
    'iìỉĩíị',
    'IÌỈĨÍỊ',
    'oòỏõóọôồổỗốộơờởỡớợ',
    'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
    'uùủũúụưừửữứự',
    'UÙỦŨÚỤƯỪỬỮỨỰ',
    'yỳỷỹýỵ',
    'YỲỶỸÝỴ',
    '-−–',
  ];
  for (var i = 0; i < AccentsMap.length; i++) {
    var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
    var char = AccentsMap[i][0];
    str = str.replace(re, char);
  }
  return str;
};

export const getHourInDateString = (dateString: string): string => {
  if (!dateString) return '';

  const regex = /T(\d{2}:\d{2}:\d{2})/;
  const result = dateString.match(regex);
  if (result) {
    return result[1];
  }

  return DayJS(dateString).tz('asia/ho_chi_minh').format('hh:mm:ss A');
};

export const getDayInDateString = (dateString: string): string => {
  if (!dateString) return '';

  const regex = /^(\d{4}-\d{2}-\d{2})/;
  const result = dateString.match(regex);
  if (result) {
    return result[1].split('-').reverse().join('-');
  }

  return DayJS(dateString).tz('asia/ho_chi_minh').format('DD-MM-YYYY');
};

export const formatDateString = (dateString: string): string => {
  return `${getDayInDateString(dateString)} ${getHourInDateString(dateString)}`;
};

export const getLinkCategory = (idCategory: string): string => {
  return `${appConfig.webUrl}/category/${idCategory}`;
};

export const getLinkPost = (idPost: string): string => {
  return `${appConfig.webUrl}/post/${idPost}`;
};

export const formatNumberWithCommas = (value: string) => {
  let formattedNumber = '';

  if (!value || value === '') {
    return '';
  }
  const raws = value.split('.');
  if (raws.length > 2) return '';

  const numberString = raws[0].split('');
  let count = 0;

  for (let i = numberString.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formattedNumber = ',' + formattedNumber;
    }
    formattedNumber = numberString[i] + formattedNumber;
    count++;
  }

  return raws.length === 2 ? `${formattedNumber}.${raws[1]}` : formattedNumber;
};

export const getFirstValueArray = (value: any) => {
  if (!value?.length) {
    return '';
  }

  return value[0];
};

export const mapToPercent = (a: number, b: number) => {
  if (!b) {
    return '0%';
  }
  return `${((a / b) * 100).toFixed(2)}%`;
};
