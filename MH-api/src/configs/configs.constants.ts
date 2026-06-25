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

/**
 * Tích hợp với hệ A (mhvn + gp). 1 account mhcom có thể đồng thời thao tác
 * với cả hai target qua header `X-A-Target`.
 *
 * Backward compat: nếu chỉ set `mhcomPrivateKeyPath` (đơn lẻ), key đó sẽ
 * được dùng cho CẢ hai target. baseUrl thì KHÔNG fallback silent vì 2 URL
 * chắc chắn khác nhau giữa mhvn và gp — phải set tường minh.
 */
export const mhcomIntegrationConfig = {
  // Private keys per target (RS256, dùng để mint token mhcom→A).
  mhcomPrivateKeyPath: process.env.MHCOM_PRIVATE_KEY_PATH, // shared fallback
  mhcomPrivateKeyPathMhvn: process.env.MHCOM_PRIVATE_KEY_PATH_MHVN,
  mhcomPrivateKeyPathGp: process.env.MHCOM_PRIVATE_KEY_PATH_GP,
  // Base URL per target. Phải set tường minh cho mỗi target khi triển khai
  // đầy đủ multi-target. `MHVN_API_BASE_URL` giữ làm fallback duy nhất nhằm
  // tương thích môi trường dev một-target.
  mhvnApiBaseUrl: process.env.MHVN_API_BASE_URL, // legacy fallback
  mhvnApiBaseUrlMhvn: process.env.MHVN_API_BASE_URL_MHVN,
  mhvnApiBaseUrlGp: process.env.MHVN_API_BASE_URL_GP,
};

// Local postcode data configuration
export const postcodeDataConfig = {
  dataPath: process.env.POSTCODE_DATA_PATH || './data',
  fileName: process.env.POSTCODE_FILE_NAME || 'postcode.csv',
};

export const nodeEnvConfig = process.env.NODE_ENV;
