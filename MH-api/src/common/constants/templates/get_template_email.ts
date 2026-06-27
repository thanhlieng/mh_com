import path from "path";
import fs from "fs";

export enum ETemplateEmail {
  MAIL_DELEVERED = "MAIL_DELEVERED",
  MAIL_SEND_CARGO_LIST = "MAIL_SEND_CARGO_LIST",
  MAIL_SEND_CREATE_STAFF = "MAIL_SEND_CREATE_STAFF",
  MAIL_SEND_CREATE_CUSTOMER = "MAIL_SEND_CREATE_CUSTOMER",
}

export const GetTemplateEmail = (
  typeTemplate: ETemplateEmail,
  data?: Object
): string => {
  let pathfile = path.join(
    __dirname,
    "../../../../src/common/constants/templates/"
  );
  switch (typeTemplate) {
    case ETemplateEmail.MAIL_DELEVERED:
      pathfile += "notification_bill_delivered.html";
      break;
    case ETemplateEmail.MAIL_SEND_CARGO_LIST:
      pathfile += "template_cargo_list_mail.html";
      break;
    case ETemplateEmail.MAIL_SEND_CREATE_STAFF:
      pathfile += "template_create_staff_mail.html";
      break;
    case ETemplateEmail.MAIL_SEND_CREATE_CUSTOMER:
      pathfile += "template_create_customer.html";
      break;

    default:
      break;
  }

  let template = fs.readFileSync(pathfile).toString();
  if (data) {
    Object.keys(data).forEach((key) => {
      template = template.split(`{{${key}}}`).join(data[key]);
    });
  }

  return template;
};
