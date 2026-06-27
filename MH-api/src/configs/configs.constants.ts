import { config } from 'dotenv';
config();

export const databaseConfig = {
  type: process.env.DB_TYPE,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  synchronize: false,
  logging: process.env.DB_LOGGING || false,
};

export const appConfig = {
  port: process.env.APP_PORT,
  acfServerGenBill: process.env.ACF_SERVER_GEN_BILL,
  webUrl: process.env.WEB_URL,
};

export const bcryptConfig = {
  saltRound: +process.env.BCRYPT_SALT_ROUNDS as unknown as number,
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  resetPasswordExpiresIn: process.env.JWT_RESET_PASSWORD_EXPIRES_IN,
};

export const nodeMailerConfig = {
  user: process.env.NODE_MAILER_USER,
  pass: process.env.NODE_MAILER_PASS,
};

export const acfConfig = {
  defaultPassword: process.env.ACF_DEFAULT_PASSWORD,
  customerAccountCodeStart: process.env.ACF_CUSTOMER_ACCOUNT_START,
  bookingCodeStart: process.env.ACF_BOOKING_CODE_START,
  emailCreateUser: process.env.EMAIL_CREATE_USER,
  defaultPUDeliveryCode: process.env.DEFAULT_PU_DELIVERY_CODE,
  pathChrome: process.env.PATH_CHROME,
  emailPOD: process.env.EMAIL_POD,
  maxProcessCreatePdfFile: Number(process.env.MAX_PROCESS_CREATE_PDF_FILE || 5),
};



export const aftershipConfig = {
  secret: process.env.AFTERSHIP_SECRET_KEY,
  url: process.env.AFTERSHIP_TRACKING_URL,
};

export const sharePointConfig = {
  tenantId: process.env.SHARE_POINT_TENANT_ID,
  clientId: process.env.SHARE_POINT_CLIENT_ID,
  clientSecret: process.env.SHARE_POINT_CLIENT_SECRET,
};

// Google Sheets configuration deprecated - using local postcode data service instead
// export const googleSheetConfig = {
//   spreadsheetId: process.env.SPREADSHEET_ID,
//   tabNamePostcode: process.env.TAB_NAME_POSTCODE,
//   apiKeyGoogle: process.env.API_KEY_GOOGLE,
// };

// Local postcode data configuration
export const postcodeDataConfig = {
  dataPath: process.env.POSTCODE_DATA_PATH || './data',
  fileName: process.env.POSTCODE_FILE_NAME || 'postcode.csv',
};

export const nodeEnvConfig = process.env.NODE_ENV;
