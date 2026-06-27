export interface ICreateTrackingAftership {
  slug: string;
  tracking_number: string;
  title: string;
  smses?: string[];
  emails?: string[];
  order_id: string;
  order_number: string;
}
