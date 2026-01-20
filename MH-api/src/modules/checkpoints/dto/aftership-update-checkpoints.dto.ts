import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsOptional, IsString } from 'class-validator';

export class AfterShipCheckpointsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country_iso3: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zip: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty()
  @IsOptional()
  coordinates: any[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  tag: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  subtag: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  subtag_message: string;

  @ApiProperty()
  @IsOptional()
  created_at: Date;

  @ApiProperty()
  @IsOptional()
  checkpoint_time: string;

  @ApiProperty()
  @IsOptional()
  slug: string;

  @ApiProperty()
  @IsOptional()
  raw_tag: string;
}

class AftershipEstimatedDto {
  @ApiProperty()
  @IsOptional()
  type: string;

  @ApiProperty()
  @IsOptional()
  source: string;

  @ApiProperty()
  @IsOptional()
  datetime: Date;

  @ApiProperty()
  @IsOptional()
  datetime_min: Date;

  @ApiProperty()
  @IsOptional()
  datetime_max: Date;
}

class aftershipEstimatedDeliveryDate {
  @ApiProperty()
  @IsOptional()
  estimated_delivery_date: Date;

  @ApiProperty()
  @IsOptional()
  confidence_score: any;

  @ApiProperty()
  @IsOptional()
  estimated_delivery_date_min: Date;

  @ApiProperty()
  @IsOptional()
  estimated_delivery_date_max: Date;
}

export class AftershipMessageDto {
  @ApiProperty()
  @IsOptional()
  tracking_number: string;

  @ApiProperty()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsOptional()
  note: string;

  @ApiProperty()
  @IsOptional()
  origin_country_iso3: string;

  @ApiProperty()
  @IsOptional()
  destination_country_iso3: string;

  @ApiProperty()
  @IsOptional()
  courier_destination_country_iso3: string;

  @ApiProperty()
  @IsOptional()
  shipment_package_count: number;

  @ApiProperty()
  @IsOptional()
  active: boolean;

  @ApiProperty()
  @IsOptional()
  order_id: string;

  @ApiProperty()
  @IsOptional()
  order_id_path: string;

  @ApiProperty()
  @IsOptional()
  order_date: Date;

  @ApiProperty()
  @IsOptional()
  customer_name: string;

  @ApiProperty()
  @IsOptional()
  source: string;

  @ApiProperty()
  @IsOptional()
  emails: string[];

  @ApiProperty()
  @IsOptional()
  smses: string[];

  @ApiProperty()
  @IsOptional()
  subscribed_smses: string[];

  @ApiProperty()
  @IsOptional()
  subscribed_emails: string[];

  @ApiProperty()
  @IsOptional()
  android: string[];

  @ApiProperty()
  @IsOptional()
  ios: string[];

  @ApiProperty()
  @IsOptional()
  return_to_sender: boolean;

  @ApiProperty()
  @IsOptional()
  custom_fields: any;

  @ApiProperty()
  @IsOptional()
  tag: string;

  @ApiProperty()
  @IsOptional()
  subtag: string;

  @ApiProperty()
  @IsOptional()
  subtag_message: string;

  @ApiProperty()
  @IsOptional()
  tracked_count: number;

  @ApiProperty()
  @IsOptional()
  expected_delivery: Date;

  @ApiProperty()
  @IsOptional()
  signed_by: any;

  @ApiProperty()
  @IsOptional()
  shipment_type: string;

  @ApiProperty()
  @IsOptional()
  created_at: Date;

  @ApiProperty()
  @IsOptional()
  updated_at: Date;

  @ApiProperty()
  @IsOptional()
  slug: string;

  @ApiProperty()
  @IsOptional()
  unique_token: string;

  @ApiProperty()
  @IsOptional()
  path: string;

  @ApiProperty()
  @IsOptional()
  shipment_weight: number;

  @ApiProperty()
  @IsOptional()
  shipment_weight_unit: string;

  @ApiProperty()
  @IsOptional()
  delivery_time: 1;

  @ApiProperty()
  @IsOptional()
  last_mile_tracking_supported: true;

  @ApiProperty()
  @IsOptional()
  language: string;

  @ApiProperty()
  @IsOptional()
  shipment_pickup_date: string;

  @ApiProperty()
  @IsOptional()
  shipment_delivery_date: string;

  @ApiProperty()
  @IsOptional()
  checkpoints: AfterShipCheckpointsDto[];

  @ApiProperty()
  @IsOptional()
  order_promised_delivery_date: Date;

  @ApiProperty()
  @IsOptional()
  delivery_type: string;

  @ApiProperty()
  @IsOptional()
  pickup_location: string;

  @ApiProperty()
  @IsOptional()
  pickup_note: string;

  @ApiProperty()
  @IsOptional()
  tracking_account_number: string;

  @ApiProperty()
  @IsOptional()
  tracking_origin_country: string;

  @ApiProperty()
  @IsOptional()
  tracking_destination_country: string;

  @ApiProperty()
  @IsOptional()
  tracking_key: string;

  @ApiProperty()
  @IsOptional()
  tracking_postal_code: string;

  @ApiProperty()
  @IsOptional()
  tracking_ship_date: Date;

  @ApiProperty()
  @IsOptional()
  tracking_state: string;

  @ApiProperty()
  @IsOptional()
  courier_tracking_link: string;

  @ApiProperty()
  @IsOptional()
  first_attempted_at: Date;

  @ApiProperty()
  @IsOptional()
  courier_redirect_link: string;

  @ApiProperty()
  @IsOptional()
  on_time_status: string;

  @ApiProperty()
  @IsOptional()
  on_time_difference: number;

  @ApiProperty()
  @IsOptional()
  order_tags: string[];

  @ApiProperty()
  @IsOptional()
  aftership_estimated_delivery_date: aftershipEstimatedDeliveryDate;

  @ApiProperty()
  @IsOptional()
  order_number: string;

  @ApiProperty()
  @IsOptional()
  latest_estimated_delivery: AftershipEstimatedDto;

  @ApiProperty()
  @IsOptional()
  shipment_tags: any[];
}

export class AftershipUpdateCheckpointsDto {
  @ApiProperty()
  @IsOptional()
  event_id: string;

  @ApiProperty()
  @IsOptional()
  event: string;

  @ApiProperty()
  @IsOptional()
  is_tracking_first_tag: boolean;

  @ApiProperty()
  @IsDefined()
  msg: AftershipMessageDto;

  @ApiProperty()
  @IsOptional()
  ts: any;
}
