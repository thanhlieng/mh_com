export interface ICheckpoints {
  id?: string;
  trackingId?: string;
  trackingNumber?: string;
  slug?: string;
  city?: string;
  location?: string;
  countryName?: string;
  message?: string;
  countryIso3?: string;
  tag?: string;
  sugtag?: string;
  sugtagMessage?: string;
  checkpointTime?: string;
  coordinates?: any[];
  state?: string;
  zip?: string;
  rawTag?: string;
  isAftershipData?: boolean;
  timezone?: string;
  createdAt?: Date;
}
