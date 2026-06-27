// import AWS from 'aws-sdk'; // Commented out - AWS SES removed
import dayjs from 'dayjs';
import mailcomposer from 'mailcomposer';
// import { awsConfig } from 'src/configs/configs.constants'; // Commented out - AWS config removed
import { countries, EFormatDate } from '../constants/common.constants';

export function replaceSpecialCharInString(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

export function convertCountryNameToSymbol(country: string) {
  country = replaceSpecialCharInString(country);
  const symbol = countries.find((ele) => ele.value.toUpperCase() === country.toUpperCase());

  return symbol ? symbol.key : country;
}

export function convertSymbolToCountryName(country: string) {
  country = replaceSpecialCharInString(country);
  const symbol = countries.find((ele) => ele.key.toUpperCase() === country.toUpperCase());

  return symbol ? symbol.value : country;
}

// const SES = new AWS.SES({
//   accessKeyId: awsConfig.accessKey,
//   secretAccessKey: awsConfig.secretAccessKey,
//   region: awsConfig.region,
// });

// export const sendMessageToEmail = async (params) => {
//   const sendPromise = SES.sendEmail(params).promise();
//   sendPromise
//     .then((data) => {
//       console.log(data);
//       return data;
//     })
//     .catch((error) => {
//       console.info('======== ERROR SEND MAIL ==========');
//       console.error(error);
//       console.info('===================================');
//       return error;
//     });
// };

// export const sendRawMessageToEmail = async (params) => {
//   let sendRawEmailPromise;

//   const mail = mailcomposer(params);

//   return new Promise((resolve, reject) => {
//     mail.build((err, message) => {
//       if (err) {
//         console.log(err);
//         reject(`Error sending raw email: ${err}`);
//       }

//       sendRawEmailPromise = SES.sendRawEmail({
//         RawMessage: { Data: message },
//       }).promise();
//     });
//     resolve(sendRawEmailPromise);
//   });
// };

export const randomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export function formatDate(date: Date, format: EFormatDate) {
  if (date === null) {
    return '';
  }

  return dayjs(date).tz('asia/ho_chi_minh').format(format);
}

export const trimArrayString = (data: string[]): string[] => {
  if (data.length === 0) return [];

  return data.map((item) => item.trim());
};
