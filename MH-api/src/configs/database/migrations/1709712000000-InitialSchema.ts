import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1709712000000 implements MigrationInterface {
  name = "InitialSchema1709712000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`CREATE TYPE "customers_status_enum" AS ENUM ('ACTIVE', 'INACTIVE')`);

    // Create sequences
    await queryRunner.query(`CREATE SEQUENCE "history_code_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE "virtual_delivery_address_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE`);

    // Create tables
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "key" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "categories_post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "thumbnail" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "name_vi" varchar NOT NULL DEFAULT '', "name_en" varchar NOT NULL DEFAULT '', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_cbba2e1306cfc4bf6577d8b477a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "commodities_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_87e26a8a62269427a70a3d3c97a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "address" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "currency_unit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_c7e44b9bbfff018bee9bbfbf35b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "customer_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_27263e272a2a6e304c9e7d69045" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_conditions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "key" varchar, CONSTRAINT "PK_bbdbd87bad2ed6b5c3293434cb9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" serial4 NOT NULL, "ip" varchar, "method" varchar, "path" varchar, "type" varchar, "action" varchar, "old_item" jsonb, "new_item" jsonb, "updated_by" uuid NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "record_id" uuid, "target_table" varchar, CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "japan_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "consignee_name_englsh" varchar NOT NULL, "consignee_name_japanese" varchar, "consignee_code" varchar, "registered_company_name" varchar, "address" varchar, CONSTRAINT "PK_e51e848540feedf522c6b3d6570" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_2f83c686af1789f11f57296618" ON "japan_address" ("consignee_name_englsh")`);
    await queryRunner.query(
      `CREATE TABLE "level_staffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_6df90ffd0f877b9575783aaf344" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "ml_exchange_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "from_currency" varchar NOT NULL, "to_currency" varchar NOT NULL, "rate" numeric NOT NULL, "time_apply_from" timestamp NOT NULL, "time_apply_to" timestamp NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_7bc475424c27e0b4f9309ef05bb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "network_customer_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_ef87d7c86f11d740fa4c7a6568c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("action" varchar NOT NULL, "description" varchar NOT NULL, "module_name" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_1c1e0637ecf1f6401beb9a68abe" PRIMARY KEY ("action"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_1c1e0637ecf1f6401beb9a68ab" ON "permissions" ("action")`);
    await queryRunner.query(
      `CREATE TABLE "postcodes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" varchar NOT NULL, "display_name" varchar NOT NULL, "town_name" varchar NOT NULL, "city_name" varchar NOT NULL, "country_name" varchar NOT NULL, CONSTRAINT "PK_a89ff6ca30ae8fc75c9e4dc5052" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_6ce1383f62a8a08ae7be538eef" ON "postcodes" ("value")`);
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "permissions" text[] NOT NULL DEFAULT '{}', "active" boolean NOT NULL DEFAULT false, "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "key" varchar, "code_aftership" varchar, "coefficient" numeric, "type_service" varchar NOT NULL DEFAULT 'SERVICE_BOOKING', "icon" varchar, "zone" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "time_zone_offset" integer NOT NULL DEFAULT 7, "html_template" varchar, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "shipping_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_134562bb545649dfeee42b86b9b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "translate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "original" varchar NOT NULL, "en" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_167007174f7df503abdb881c186" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "type_of_payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "key" varchar, CONSTRAINT "PK_f025fc29529f8c35f6f67117739" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE TABLE "typeorm_metadata" ("type" varchar NOT NULL, "database" varchar, "schema" varchar, "table" varchar, "name" varchar, "value" text)`);
    await queryRunner.query(
      `CREATE TABLE "virtual_delivery_address" ("id" serial4 NOT NULL, "name" varchar, "address" varchar, "province" varchar, "country" varchar, "phone_number" varchar, "postal_code" varchar, "weight" float8, CONSTRAINT "PK_1c51cecfc5418a642edee012db4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "connect_bill" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "export_form" varchar NOT NULL, "service_id" uuid NOT NULL, "partner_id" uuid NOT NULL, "connection_partner_id" uuid NOT NULL, "transportation_type" varchar NOT NULL, "mawb_code" varchar NOT NULL, "flight_code" varchar NOT NULL, "flight_time" timestamp NOT NULL, "sending_airport" varchar NOT NULL, "receiving_airport" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_f64e1ae5de3ca06c9aa587fcdbb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "item_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_id" uuid NOT NULL, "name" varchar NOT NULL, "key" varchar, "is_default" boolean NOT NULL DEFAULT false, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_db3359595abacbe15cf2f89c07e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "thumbnail" varchar, "category_id" uuid, "title_vi" varchar NOT NULL DEFAULT '', "title_en" varchar NOT NULL DEFAULT '', "description_vi" varchar, "description_en" varchar, "content_vi" varchar, "content_en" varchar, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "units" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid, "name" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_5a8f2f064919b587d93936cb223" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" varchar NOT NULL, "role_id" uuid NOT NULL, "password" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'inactive', "salt" varchar, "type" varchar NOT NULL DEFAULT 'CLIENT', "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "zone_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "name" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_c3f51d78c5b33787685c2ca29e4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "homepage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name_vi" varchar NOT NULL DEFAULT '', "name_en" varchar NOT NULL DEFAULT '', "link" varchar, "type_link" varchar NOT NULL DEFAULT 'LINK', "category_id" uuid, "post_id" uuid, "type" varchar NOT NULL, "position" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_8341e9d8392426fd37436aaca9d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "staffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_code" varchar NOT NULL, "unit_id" uuid, "user_id" uuid, "department_id" uuid, "full_name" varchar NOT NULL, "position" varchar, "gender" varchar NOT NULL, "day_of_birth" timestamp NOT NULL, "place_of_birth" varchar NOT NULL, "temporary_address" varchar NOT NULL, "permanent_address" varchar NOT NULL, "ethnic" varchar NOT NULL, "religion" varchar NOT NULL, "nationality" varchar NOT NULL, "level" varchar NOT NULL, "marital" varchar NOT NULL, "element" varchar, "email" varchar NOT NULL, "phone_number" varchar NOT NULL, "phone_code" varchar NOT NULL, "people_id" varchar NOT NULL, "issue_date" timestamp NOT NULL, "issue_place" varchar NOT NULL, "region" uuid NOT NULL, "tax_code" varchar, "bank_account_number" varchar, "bank_code" varchar, "social_insurance_id" varchar, "health_insurance_id" varchar, "union_book_number" varchar, "insurance_participation_date" timestamp, "issue_insurance_date" timestamp, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "status" varchar NOT NULL DEFAULT 'active', "files" text[], "email_company" varchar, "latest_promotion_date" timestamp, CONSTRAINT "PK_f3fec5e06209b46afdf8accf117" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "role_id" uuid, CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_code" varchar NOT NULL, "unit_id" uuid, "company_id" uuid, "staff_id" uuid, "user_id" uuid, "full_name" varchar NOT NULL, "full_name_en" varchar, "customer_group" varchar, "detail_address" varchar NOT NULL, "detail_address_en" varchar, "gender" varchar, "date_of_birth" timestamp, "commune" varchar, "district" varchar, "province" varchar, "country" varchar, "contact_person" varchar NOT NULL, "phone_number" varchar NOT NULL, "phone_code" varchar, "mobile" varchar, "fax" varchar, "website" varchar, "email" varchar NOT NULL, "type_customer" varchar NOT NULL DEFAULT 'INDIVIDUAL_CUSTOMER', "type" varchar NOT NULL DEFAULT 'TRIAL_CUSTOMER', "service" text[], "post_code" varchar, "state" varchar, "note" varchar, "identifier_type" varchar, "identifier" varchar, "beneficiary" varchar, "job_title" varchar, "beneficiary_phone" varchar, "is_direct_beneficiary" boolean, "relationship_beneficiaries" varchar, "beneficiary_account_number" varchar, "beneficiary_bank" varchar, "lkd_rate" integer, "beneficiary_note" varchar, "type_of_payment" varchar, "previous_cosing" varchar, "finance_note" varchar, "notify_email" varchar, "notify_other_email" varchar, "notify_contact_person" varchar, "booking_email" varchar, "booking_phone" varchar, "booking_mobile" varchar, "order_email_customer" varchar, "order_other_email" varchar, "order_contact_person" varchar, "order_email" varchar, "order_phone" varchar, "debt_contact_person" varchar, "debt_email" varchar, "debt_phone" varchar, "debt_mobile" varchar, "debt_address" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "status" "customers_status_enum" NOT NULL DEFAULT 'ACTIVE', "open_date" timestamp, "notify_price_list_note" varchar, "order_note" varchar, "debt_note" varchar, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "management_staff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "staff_id" uuid NOT NULL, "type_staff" varchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_4b0b49732a13e422cc107782f7c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "price_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "service_request_id" uuid, "potential_revenue_from" float8, "potential_revenue_to" float8, "fixed_price_code" varchar, "lkd_rate" float8, "surcharge" varchar, "exchange_rate" varchar, "time_apply_from" timestamp, "time_apply_to" timestamp, "other_price" varchar, "discount_rate" varchar, "note_price_list" varchar, "files" varchar[], "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "price_list_requested" varchar, "price_code_document" varchar, "light_price_code" varchar, "heavy_price_code" varchar, "note_price_list_2" varchar, CONSTRAINT "PK_52ea7826468b1c889cb2c28df03" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "receiver_customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sender_id" uuid NOT NULL, "name" varchar NOT NULL, "contact_person_name" varchar NOT NULL, "mobile" varchar NOT NULL, "phone_number" varchar NOT NULL, "phone_code" varchar NOT NULL, "country" varchar NOT NULL, "district" varchar NOT NULL, "province" varchar NOT NULL, "commune" varchar NOT NULL, "postal_code" varchar, "detail_address" varchar NOT NULL, "state" varchar, "note" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_0da6f9b6d48155786e8af4eb83d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "address_books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" varchar, "customer_id" uuid, "default" boolean DEFAULT false, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "sender_name_vi" varchar, "sender_name_en" varchar, "sender_address_vi" varchar, "sender_address_en" varchar, "sender_contact_person" varchar, "sender_department" varchar, "sender_phone_number" varchar, "sender_note" varchar, "sender_country" varchar, "sender_province" varchar, "sender_postal_code" varchar, "receiver_address" varchar, "receiver_name" varchar, "receiver_postal_code" varchar, "receiver_country" varchar, "receiver_province" varchar, "receiver_contact_person" varchar, "receiver_department" varchar, "receiver_phone_number" varchar, "receiver_note" varchar, "sender_town" varchar, "receiver_town" varchar, "sender_address_en_1" varchar DEFAULT '', "sender_address_en_2" varchar DEFAULT '', "sender_address_en_3" varchar DEFAULT '', "sender_phone_number_2" varchar, "receiver_address_1" varchar NOT NULL DEFAULT '', "receiver_address_2" varchar NOT NULL DEFAULT '', "receiver_address_3" varchar NOT NULL DEFAULT '', "receiver_phone_number_2" varchar, CONSTRAINT "PK_70a48906474ffacab15adec82c5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unit_id" uuid, "is_invoice" boolean NOT NULL DEFAULT false, "type" varchar NOT NULL, "booking_code" varchar NOT NULL, "customer_id" uuid NOT NULL, "service_booking_id" uuid NOT NULL, "estimate_date" timestamp NOT NULL, "estimate_hour" varchar NOT NULL DEFAULT '00:00', "delivery_condition_id" uuid NOT NULL, "other_delivery_conditions" varchar, "note" varchar, "payment" varchar, "type_of_payment_id" uuid NOT NULL, "oder_account_foreign" varchar, "is_customer_create_declaration" boolean DEFAULT false, "is_customs_declaration" boolean DEFAULT false, "customs_declaration_number" varchar, "parent_booking" varchar, "is_created_small_booking" boolean NOT NULL DEFAULT false, "sender_name_vi" varchar DEFAULT '', "sender_name_en" varchar, "sender_address_vi" varchar DEFAULT '', "sender_address_en" varchar DEFAULT '', "sender_contact_person" varchar NOT NULL, "sender_department" varchar, "sender_phone_number" varchar NOT NULL, "sender_note" varchar, "sender_country" varchar, "sender_province" varchar, "sender_postal_code" varchar, "receiver_address" varchar NOT NULL DEFAULT '', "receiver_name" varchar NOT NULL, "receiver_postal_code" varchar, "receiver_country" varchar NOT NULL, "receiver_province" varchar, "receiver_contact_person" varchar NOT NULL, "receiver_department" varchar, "receiver_phone_number" varchar NOT NULL, "receiver_note" varchar, "is_handle" boolean DEFAULT false, "status" varchar NOT NULL DEFAULT 'NOT_YET_HANDED_OVER', "total" bigint, "vat" bigint, "amount" bigint, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "partner_bill_code" varchar, "partner_service" uuid, "manufacture" varchar, "partner_bill_code_domestic" varchar, "partner_service_domestic" uuid, "manufacture_domestic" varchar, "partner_bill_code_foreign" varchar, "partner_service_foreign" uuid, "manufacture_foreign" varchar, "value_added_service_1" varchar, "value_added_service_2" varchar, "value_added_service_3" varchar, "dhl" integer[], "fedex" integer[], "ups" integer[], "sender_town" varchar, "receiver_town" varchar, "pickup_id" uuid, "parent_booking_manifest_id" uuid, "is_splited_booking_manifest" boolean NOT NULL DEFAULT false, "sender_address_en_1" varchar DEFAULT '', "sender_address_en_2" varchar DEFAULT '', "sender_address_en_3" varchar DEFAULT '', "sender_phone_number_2" varchar, "sender_other_shipping_address" varchar, "receiver_address_1" varchar DEFAULT '', "receiver_address_2" varchar DEFAULT '', "receiver_address_3" varchar DEFAULT '', "receiver_phone_number_2" varchar, "reason_cancel_booking" varchar, "package_id_manifest" varchar, "reference_no_manifest" varchar, "gw_manifest" numeric, "freight_charge_manifest" numeric, "item_name_manifest" varchar, "length_manifest" numeric, "width_manifest" numeric, "height_manifest" numeric, "consignee_name_japanese_manifest" varchar, "consignee_code_manifest" varchar, "registered_company_name_manifest" varchar, "canceled_date" timestamp, "address_manifest" varchar, "qty_manifest" integer, "uom_manifest" varchar, "invoice_cur_manifest" varchar, "payment_term_manifest" integer, "partner_invoice_manifest" varchar, "unit_price_manifest" numeric, "partner_code_mapping" varchar, "origin_of_country" varchar, "reference_code" varchar, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "booking_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid, "calculation_unit" varchar NOT NULL, "commodities_type_id" uuid, "shipping_item_vi_id" uuid, "description" varchar NOT NULL, "origin_item" varchar NOT NULL, "shipping_item_en" varchar, "quantity" integer NOT NULL, "weight" numeric NOT NULL, "height" numeric, "width" numeric, "longs" numeric, "bulky_weight" numeric, "note" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_6e95d603aebbeed01303d73c50b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "cargo_list_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_1c6b6225e477972412a169fe47d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "contract" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid, "service" uuid, "contract_code" varchar, "contract_name" varchar, "type_contract" varchar, "contract_term_from" timestamp, "contract_term_to" timestamp, "payment_schedule" varchar, "expertise" boolean DEFAULT true, "note_contract" varchar, "files" varchar[], "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "appraisal_staff" uuid, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "customer_contract" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "company_name" varchar, "address" varchar NOT NULL, "phone_number" varchar, "bank_account_number" varchar, "bank_code" varchar, "tax_code" varchar NOT NULL, "nominee_name" varchar, "position" varchar, "payment_date" timestamp NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_a716b1113d1ef6ee28af1a35bcd" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "finance_cpn" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "billable_weight" numeric, "coefficient_pp_price" numeric, "pp1_price" numeric, "gv_pp1_price" numeric, "gvg_pp1_price" numeric, "pp2_price" numeric, "gv_pp2_price" numeric, "gvg_pp2_price" numeric, "pp3_price" numeric, "gv_pp3_price" numeric, "gvg_pp3_price" numeric, "note_pp_price" numeric, "extend_pp_1" numeric, "extend_gv_pp_1" numeric, "extend_gvg_pp_1" numeric, "extend_pp_2" numeric, "extend_gv_pp_2" numeric, "extend_gvg_pp_2" numeric, "extend_pp_3" numeric, "extend_gv_pp_3" numeric, "extend_gvg_pp_3" numeric, "extend_pp_4" numeric, "extend_gv_pp_4" numeric, "extend_gvg_pp_4" numeric, "extend_pp_5" numeric, "extend_gv_pp_5" numeric, "extend_gvg_pp_5" numeric, "note_extend_extend_pp" numeric, "coefficient_sales_price" numeric, "coefficient_shareholder_equity_price" numeric, "coefficient_original_cost_price" numeric, "original_lkd" numeric, "lkd_self_calculated" numeric, "original_ppxd" numeric, "ppxd_self_calculated" numeric, "total_origin_gv_partner" numeric, "diff_origin_gv_acf_partner" numeric, "ros_sales" numeric, "ros" numeric, "verified" varchar, "note" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "booking_id" uuid, "business_staff_id" uuid, "last_sent" timestamp, "currency" varchar DEFAULT 'USD', "exchange_rate_id" uuid, "ales_price" numeric NOT NULL DEFAULT 0, "shareholder_equity_price" numeric NOT NULL DEFAULT 0, "original_cost_price" numeric NOT NULL DEFAULT 0, "lkd_sales_price" numeric NOT NULL DEFAULT 0, "total_pp_price" numeric NOT NULL DEFAULT 0, "gv_total_pp_price" numeric NOT NULL DEFAULT 0, "gv_origin_total_pp_price" numeric NOT NULL DEFAULT 0, "total_sales_price" numeric NOT NULL DEFAULT 0, "gv_total_sales_price" numeric NOT NULL DEFAULT 0, "gv_origin_sales_price" numeric NOT NULL DEFAULT 0, "ppxd" numeric NOT NULL DEFAULT 0, "gv_ppxd" numeric NOT NULL DEFAULT 0, "gv_origin_ppxd" numeric NOT NULL DEFAULT 0, "total_extend_pp" numeric NOT NULL DEFAULT 0, "total_extend_gv_pp" numeric NOT NULL DEFAULT 0, "total_origin_extend_gv_pp" numeric NOT NULL DEFAULT 0, "total_sales" numeric NOT NULL DEFAULT 0, "total_shareholder_equity" numeric NOT NULL DEFAULT 0, "total_origin_gv_acf" numeric NOT NULL DEFAULT 0, "total_sales_permanent" numeric NOT NULL DEFAULT 0, "total_origin_sales" numeric NOT NULL DEFAULT 0, "dividend_2_percent" numeric NOT NULL DEFAULT 0, "sales_for_business" numeric NOT NULL DEFAULT 0, "bonus" numeric NOT NULL DEFAULT 0, "remaining_profit" numeric NOT NULL DEFAULT 0, "original_vat" numeric NOT NULL DEFAULT 0, "vat" numeric NOT NULL DEFAULT 0, "total_sales_vat" numeric NOT NULL DEFAULT 0, "sales_price" numeric NOT NULL DEFAULT 0, CONSTRAINT "PK_e62b922f13921236fd4a91c9b99" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid, "type_item_invoice" varchar DEFAULT 'Commercial_Goods', "invoice_type" varchar DEFAULT 'Commercial_Invoice', "sender_information" varchar, "receiver_information" varchar, "invoice_date" timestamp, "importers" varchar, "invoice_number" varchar, "service_id" uuid, "total_net_weight" numeric, "total_bulky_weight" numeric, "goods_size" text, "total_bale_number" numeric, "currency_id" uuid, "reason_export" varchar, "note" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "is_additional" boolean NOT NULL DEFAULT false, "type" varchar NOT NULL DEFAULT 'OFFICIAL', "template_name" varchar, "delivery_condition_id" uuid, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "invoice_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL, "goods_name" varchar NOT NULL, "describe" varchar NOT NULL, "quantity" numeric NOT NULL, "unit_of_measure" varchar NOT NULL, "price" numeric NOT NULL, "weight" numeric, "origin_of_goods" varchar NOT NULL, "HS_code" varchar, "total_money" numeric, CONSTRAINT "PK_3d65640b01305b25702d2de67c4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "other_price" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price_list_id" uuid NOT NULL, "country_contract_id" uuid, "discount_rate" text, "note_other_price" varchar, CONSTRAINT "PK_ddaf4ae8a9409d5207691c9f6cc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pu_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid, "pu_staff_id" uuid, "connect_bill_id" uuid, "status" integer, "type" varchar, "quantity" integer, "service_booking_id" uuid, "content_detail" varchar, "customs_declaration_number" varchar, "note" varchar, "booking_partner_bill_code" varchar, "booking_partner_service" uuid, "content_detail_invoice" varchar, "information_receiver_address" varchar, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "require_partner_service_id" uuid, "parent_booking_manifest_id" uuid, "is_splited_booking" boolean NOT NULL DEFAULT false, "billable_weight" numeric, "price_usd" numeric, "price_vnd" numeric, "lkd_price_usd" numeric, "lkd_price_vnd" numeric, "total_pp_usd" numeric, "total_pp_vnd" numeric, "total_selling_price_usd" numeric, "total_selling_price_vnd" numeric, "ppxd_usd" numeric, "ppxd_vnd" numeric, "total_external_pp_usd" numeric, "total_external_pp_vnd" numeric, "total_sales_usd" numeric, "total_sales_vnd" numeric, "vat_usd" numeric, "total_sales_including_vat_usd" numeric, "vat_vnd" numeric, "total_sales_including_vat_vnd" numeric, "note_order_remaining" varchar, "sales_staff_id" uuid, "checkin_staff_id" uuid, "checkout_staff_id" uuid, "manifest_staff_id" uuid, CONSTRAINT "PK_b118a955eac12a8c752a8f83d79" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pu_deliveries_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pu_delivery_id" uuid NOT NULL, "quantity" float8 NOT NULL, "weight" float8 NOT NULL, "bulky_weight" float8, "height" float8 NOT NULL, "width" float8 NOT NULL, "longs" float8 NOT NULL, "type" varchar NOT NULL DEFAULT 'PICKUP', CONSTRAINT "PK_df0004502e8e0036af9fb1a0701" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "trackings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid NOT NULL, "tracking_number" varchar, "title" varchar, "note" varchar, "origin_country_iso3" varchar, "description_country_iso3" varchar, "courier_destination_country_iso3" varchar, "shipment_package_count" integer, "active" boolean, "order_id" varchar, "order_id_path" varchar, "order_date" timestamp, "customer_name" varchar, "source" varchar, "tag" varchar, "subtag" varchar, "subtagMessage" varchar, "tracked_count" numeric, "expected_delivery" timestamp, "shipment_type" varchar, "slug" varchar, "unique_token" varchar, "path" varchar, "shipment_weight" numeric, "shipment_weight_unit" varchar, "delivery_time" integer, "language" varchar, "order_promised_delivery_date" timestamp, "delivery_type" varchar, "pickup_location" varchar, "pickup_note" varchar, "tracking_account_number" varchar, "tracking_origin_country" varchar, "tracking_destination_country" varchar, "tracking_key" varchar, "tracking_postal_code" varchar, "tracking_ship_date" timestamp, "tracking_state" varchar, "on_time_status" varchar, "on_time_difference" numeric, "aftership_estimated_delivery_date" text, "order_number" varchar, "latest_estimated_delivery" text, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "shipment_pickup_date" varchar, "shipment_delivery_date" varchar, "latest_message" varchar NOT NULL DEFAULT '', CONSTRAINT "PK_8d2bbd5e716298fa0b70749f9eb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "checkpoints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tracking_id" uuid, "tracking_number" varchar, "slug" varchar, "city" varchar, "location" varchar, "country_name" varchar, "message" varchar, "country_iso3" varchar, "tag" varchar, "sugtag" varchar, "sugtag_message" varchar, "coordinates" text[], "state" varchar, "zip" varchar, "raw_tag" varchar, "is_aftership_data" boolean, "created_at" timestamp DEFAULT now(), "updated_at" timestamp NOT NULL, "checkpoint_time" varchar, "timezone" varchar, CONSTRAINT "PK_dfcc46a91d96ecba8a8dcd8b11c" PRIMARY KEY ("id"))`
    );

    // Create foreign key constraints
    await queryRunner.query(`ALTER TABLE "connect_bill" ADD CONSTRAINT "FK_731d5a1a0e05de2ad41518a185b" FOREIGN KEY ("connection_partner_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "connect_bill" ADD CONSTRAINT "FK_9e698b2ea6200ee8cdb09700910" FOREIGN KEY ("partner_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "connect_bill" ADD CONSTRAINT "FK_bccfffd4fbf86a05b9707ce7998" FOREIGN KEY ("service_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "item_categories" ADD CONSTRAINT "FK_85aa6c4dd057e26e08b1d3919fd" FOREIGN KEY ("category_id") REFERENCES "categories"("id")`);
    await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_852f266adc5d67c40405c887b49" FOREIGN KEY ("category_id") REFERENCES "categories_post"("id")`);
    await queryRunner.query(`ALTER TABLE "units" ADD CONSTRAINT "FK_3061afe5df76df44acb79d8fc2b" FOREIGN KEY ("company_id") REFERENCES "companies"("id")`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id")`);
    await queryRunner.query(`ALTER TABLE "zone_services" ADD CONSTRAINT "FK_a4a895fb711550fdb8e8b9cfe00" FOREIGN KEY ("service_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "homepage" ADD CONSTRAINT "FK_4b6eaa49f4e036ac1442802df3b" FOREIGN KEY ("post_id") REFERENCES "posts"("id")`);
    await queryRunner.query(`ALTER TABLE "homepage" ADD CONSTRAINT "FK_c458f3d983a18e66ee26588ae87" FOREIGN KEY ("category_id") REFERENCES "categories_post"("id")`);
    await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_66a38acc9b5ab4c961c9733dcc9" FOREIGN KEY ("unit_id") REFERENCES "units"("id")`);
    await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_8f86637f3f8db5219bf08ae4258" FOREIGN KEY ("department_id") REFERENCES "department"("id")`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f" FOREIGN KEY ("role_id") REFERENCES "roles"("id")`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_100d9b7f01d2b7152e10c33c89e" FOREIGN KEY ("unit_id") REFERENCES "units"("id")`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_11d81cd7be87b6f8865b0cf7661" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_f0e29920aaf871f3eddbea69f0d" FOREIGN KEY ("company_id") REFERENCES "companies"("id")`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_f7e3f0d9967de8f5a284c6ffd99" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id")`);
    await queryRunner.query(`ALTER TABLE "management_staff" ADD CONSTRAINT "FK_637175838d7f5b54774bee44980" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id")`);
    await queryRunner.query(`ALTER TABLE "management_staff" ADD CONSTRAINT "FK_70035a96777491fc6706f054075" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "price_list" ADD CONSTRAINT "FK_8912f4bd276d481ce847fdc1400" FOREIGN KEY ("service_request_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "price_list" ADD CONSTRAINT "FK_cfeaceaf11f36bb098ca7ad0858" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "receiver_customer" ADD CONSTRAINT "FK_e5baf09bd706f733791c5a788b6" FOREIGN KEY ("sender_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "address_books" ADD CONSTRAINT "FK_179f974c8ee898136d2ff19d78f" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_0f3f4786e828ef620c5a8badc87" FOREIGN KEY ("type_of_payment_id") REFERENCES "type_of_payment"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_22e30f12b2c4281b0d28d1811dc" FOREIGN KEY ("unit_id") REFERENCES "units"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_240d8e1e4d37ca7aeec70d7a5f9" FOREIGN KEY ("partner_service_domestic") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_53eb14b6a83c23dab313273e475" FOREIGN KEY ("service_booking_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_5567c385c0c508eb5fc1340edc2" FOREIGN KEY ("partner_service") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_725782dfa4580288847e3ec6d0b" FOREIGN KEY ("parent_booking_manifest_id") REFERENCES "booking"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_73802ceca7112a820f6d1f1e8ce" FOREIGN KEY ("partner_service_foreign") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_ad6bb51eb39382f5523ea11677d" FOREIGN KEY ("delivery_condition_id") REFERENCES "delivery_conditions"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_ae80346292fa587731a5d2546e6" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_fa2e4a337f0ba299f72d4190231" FOREIGN KEY ("pickup_id") REFERENCES "staffs"("id")`);
    await queryRunner.query(`ALTER TABLE "booking_detail" ADD CONSTRAINT "FK_0fb66db3975ad7c37749613702d" FOREIGN KEY ("shipping_item_vi_id") REFERENCES "shipping_item"("id")`);
    await queryRunner.query(`ALTER TABLE "booking_detail" ADD CONSTRAINT "FK_17a6ca4e0cbb7a9b5dc9e40c85e" FOREIGN KEY ("commodities_type_id") REFERENCES "commodities_type"("id")`);
    await queryRunner.query(`ALTER TABLE "booking_detail" ADD CONSTRAINT "FK_9d653303b2704bb03eba7c71c8b" FOREIGN KEY ("booking_id") REFERENCES "booking"("id")`);
    await queryRunner.query(`ALTER TABLE "cargo_list_log" ADD CONSTRAINT "FK_020f7413e58bdbc92db7644cc48" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "cargo_list_log" ADD CONSTRAINT "FK_2beae0eaf0127c4a68ea3c90b96" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "contract" ADD CONSTRAINT "FK_270712d79f00272f1d948beb082" FOREIGN KEY ("appraisal_staff") REFERENCES "staffs"("id")`);
    await queryRunner.query(`ALTER TABLE "contract" ADD CONSTRAINT "FK_a22a6abb4cf11c3b460f65aa6a8" FOREIGN KEY ("service") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "contract" ADD CONSTRAINT "FK_abdcabff39fa6c1acbb67d69a03" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "customer_contract" ADD CONSTRAINT "FK_34b7da45f312dc064b8e151ba55" FOREIGN KEY ("customer_id") REFERENCES "customers"("id")`);
    await queryRunner.query(`ALTER TABLE "finance_cpn" ADD CONSTRAINT "FK_52005126d04209f8b5d8c156cc7" FOREIGN KEY ("booking_id") REFERENCES "booking"("id")`);
    await queryRunner.query(
      `ALTER TABLE "finance_cpn" ADD CONSTRAINT "FK_7055f445a3fe50004f21fdf88ea" FOREIGN KEY ("exchange_rate_id") REFERENCES "ml_exchange_rates"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "finance_cpn" ADD CONSTRAINT "FK_7c3c817c18130658241e10f6313" FOREIGN KEY ("business_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_178cc7f799b0d7f600aaa87b5eb" FOREIGN KEY ("service_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_37cccd553cb1b340c4ac7670e70" FOREIGN KEY ("currency_id") REFERENCES "currency_unit"("id")`);
    await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_e135d8da23edd3d3b5a55190aaf" FOREIGN KEY ("delivery_condition_id") REFERENCES "delivery_conditions"("id")`);
    await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_ee283c9adbadc5f1a2ff392eee5" FOREIGN KEY ("booking_id") REFERENCES "booking"("id")`);
    await queryRunner.query(`ALTER TABLE "invoice_detail" ADD CONSTRAINT "FK_123a8440e2987297f6c8cc6a355" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id")`);
    await queryRunner.query(`ALTER TABLE "other_price" ADD CONSTRAINT "FK_7e370f72dbc8e738bd04cc8e338" FOREIGN KEY ("country_contract_id") REFERENCES "zone_services"("id")`);
    await queryRunner.query(`ALTER TABLE "other_price" ADD CONSTRAINT "FK_8415208303793d03abbcd66a1e3" FOREIGN KEY ("price_list_id") REFERENCES "price_list"("id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_1428c0474ac5569f37e764a086f" FOREIGN KEY ("service_booking_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_1484e78969c3db1d593054f4001" FOREIGN KEY ("require_partner_service_id") REFERENCES "services"("id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_20e00929a9814bee3321dbd5885" FOREIGN KEY ("booking_partner_service") REFERENCES "services"("id")`);
    await queryRunner.query(
      `ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_6748d99b0f46b0cd6d9c12990ff" FOREIGN KEY ("sales_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_95c41f5279c57bda8eb21091191" FOREIGN KEY ("checkout_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_ab430f09e3aeaf1901ec6925ca5" FOREIGN KEY ("checkin_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_c090cba9476a9bafb836aa0d776" FOREIGN KEY ("parent_booking_manifest_id") REFERENCES "pu_deliveries"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_d9e7d00df7f1c673f3f31e2a927" FOREIGN KEY ("manifest_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_e85b7fa33d2203b4e6ec54f0950" FOREIGN KEY ("booking_id") REFERENCES "booking"("id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_e8f117e03fd01db058605575418" FOREIGN KEY ("pu_staff_id") REFERENCES "staffs"("id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "FK_fbff775ca0302a34f56732f992e" FOREIGN KEY ("connect_bill_id") REFERENCES "connect_bill"("id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries_detail" ADD CONSTRAINT "FK_c360e26309232846a2fc6160dd1" FOREIGN KEY ("pu_delivery_id") REFERENCES "pu_deliveries"("id")`);
    await queryRunner.query(`ALTER TABLE "trackings" ADD CONSTRAINT "FK_51ab0edf2f6b4c54e67d2a61972" FOREIGN KEY ("booking_id") REFERENCES "booking"("id")`);
    await queryRunner.query(`ALTER TABLE "checkpoints" ADD CONSTRAINT "FK_5317ef54e5765a3c4fc02090b88" FOREIGN KEY ("tracking_id") REFERENCES "trackings"("id")`);

    // Create unique constraints
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
    await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "REL_7953eac210a0e34a3e82a3c533" UNIQUE ("user_id")`);
    await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "UQ_a4866898c9c924ec522162072c1" UNIQUE ("staff_code")`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "REL_11d81cd7be87b6f8865b0cf766" UNIQUE ("user_id")`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "UQ_acd5656a9fa7cf04125f0848165" UNIQUE ("customer_code")`);
    await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "UQ_baf7e49c4f7b05acfefbf9dbb18" UNIQUE ("booking_code")`);
    await queryRunner.query(`ALTER TABLE "finance_cpn" ADD CONSTRAINT "REL_52005126d04209f8b5d8c156cc" UNIQUE ("booking_id")`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" ADD CONSTRAINT "UQ_e85b7fa33d2203b4e6ec54f0950" UNIQUE ("booking_id")`);
    await queryRunner.query(`ALTER TABLE "trackings" ADD CONSTRAINT "UQ_51ab0edf2f6b4c54e67d2a61972" UNIQUE ("booking_id")`);

    // Create trigger function
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION create_booking_function()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            Declare lastcode character varying := NULL;
            begin
                BEGIN
                    SELECT booking.booking_code INTO lastcode from booking
                    ORDER BY booking_code DESC
                    LIMIT 1;
                END;

                IF lastcode IS NULL THEN
                    NEW.booking_code := '893170000000';
                ELSE
                    NEW.booking_code := (cast(lastcode as int8) + 11)::character varying;
                END IF;
                
                return NEW;
            end;
            $function$;
        `);

    // Create trigger
    await queryRunner.query(`
            CREATE TRIGGER create_booking_tri
            BEFORE INSERT ON booking
            FOR EACH ROW
            EXECUTE FUNCTION create_booking_function();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS "create_booking_tri" ON "booking"`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS "create_booking_function"()`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "checkpoints" DROP CONSTRAINT "FK_5317ef54e5765a3c4fc02090b88"`);
    await queryRunner.query(`ALTER TABLE "trackings" DROP CONSTRAINT "FK_51ab0edf2f6b4c54e67d2a61972"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries_detail" DROP CONSTRAINT "FK_c360e26309232846a2fc6160dd1"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_fbff775ca0302a34f56732f992e"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_e8f117e03fd01db058605575418"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_e85b7fa33d2203b4e6ec54f0950"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_d9e7d00df7f1c673f3f31e2a927"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_ab430f09e3aeaf1901ec6925ca5"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_95c41f5279c57bda8eb21091191"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_6748d99b0f46b0cd6d9c12990ff"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_20e00929a9814bee3321dbd5885"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_1484e78969c3db1d593054f4001"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "FK_1428c0474ac5569f37e764a086f"`);
    await queryRunner.query(`ALTER TABLE "other_price" DROP CONSTRAINT "FK_8415208303793d03abbcd66a1e3"`);
    await queryRunner.query(`ALTER TABLE "other_price" DROP CONSTRAINT "FK_7e370f72dbc8e738bd04cc8e338"`);
    await queryRunner.query(`ALTER TABLE "invoice_detail" DROP CONSTRAINT "FK_123a8440e2987297f6c8cc6a355"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_ee283c9adbadc5f1a2ff392eee5"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_e135d8da23edd3d3b5a55190aaf"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_37cccd553cb1b340c4ac7670e70"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_178cc7f799b0d7f600aaa87b5eb"`);
    await queryRunner.query(`ALTER TABLE "finance_cpn" DROP CONSTRAINT "FK_7c3c817c18130658241e10f6313"`);
    await queryRunner.query(`ALTER TABLE "finance_cpn" DROP CONSTRAINT "FK_7055f445a3fe50004f21fdf88ea"`);
    await queryRunner.query(`ALTER TABLE "finance_cpn" DROP CONSTRAINT "FK_52005126d04209f8b5d8c156cc7"`);
    await queryRunner.query(`ALTER TABLE "customer_contract" DROP CONSTRAINT "FK_34b7da45f312dc064b8e151ba55"`);
    await queryRunner.query(`ALTER TABLE "contract" DROP CONSTRAINT "FK_abdcabff39fa6c1acbb67d69a03"`);
    await queryRunner.query(`ALTER TABLE "contract" DROP CONSTRAINT "FK_a22a6abb4cf11c3b460f65aa6a8"`);
    await queryRunner.query(`ALTER TABLE "contract" DROP CONSTRAINT "FK_270712d79f00272f1d948beb082"`);
    await queryRunner.query(`ALTER TABLE "cargo_list_log" DROP CONSTRAINT "FK_2beae0eaf0127c4a68ea3c90b96"`);
    await queryRunner.query(`ALTER TABLE "cargo_list_log" DROP CONSTRAINT "FK_020f7413e58bdbc92db7644cc48"`);
    await queryRunner.query(`ALTER TABLE "booking_detail" DROP CONSTRAINT "FK_9d653303b2704bb03eba7c71c8b"`);
    await queryRunner.query(`ALTER TABLE "booking_detail" DROP CONSTRAINT "FK_17a6ca4e0cbb7a9b5dc9e40c85e"`);
    await queryRunner.query(`ALTER TABLE "booking_detail" DROP CONSTRAINT "FK_0fb66db3975ad7c37749613702d"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_fa2e4a337f0ba299f72d4190231"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_ae80346292fa587731a5d2546e6"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_ad6bb51eb39382f5523ea11677d"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_73802ceca7112a820f6d1f1e8ce"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_725782dfa4580288847e3ec6d0b"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_5567c385c0c508eb5fc1340edc2"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_53eb14b6a83c23dab313273e475"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_240d8e1e4d37ca7aeec70d7a5f9"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_22e30f12b2c4281b0d28d1811dc"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_0f3f4786e828ef620c5a8badc87"`);
    await queryRunner.query(`ALTER TABLE "address_books" DROP CONSTRAINT "FK_179f974c8ee898136d2ff19d78f"`);
    await queryRunner.query(`ALTER TABLE "receiver_customer" DROP CONSTRAINT "FK_e5baf09bd706f733791c5a788b6"`);
    await queryRunner.query(`ALTER TABLE "price_list" DROP CONSTRAINT "FK_cfeaceaf11f36bb098ca7ad0858"`);
    await queryRunner.query(`ALTER TABLE "price_list" DROP CONSTRAINT "FK_8912f4bd276d481ce847fdc1400"`);
    await queryRunner.query(`ALTER TABLE "management_staff" DROP CONSTRAINT "FK_70035a96777491fc6706f054075"`);
    await queryRunner.query(`ALTER TABLE "management_staff" DROP CONSTRAINT "FK_637175838d7f5b54774bee44980"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_f7e3f0d9967de8f5a284c6ffd99"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_f0e29920aaf871f3eddbea69f0d"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_11d81cd7be87b6f8865b0cf7661"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_100d9b7f01d2b7152e10c33c89e"`);
    await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"`);
    await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_8f86637f3f8db5219bf08ae4258"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_66a38acc9b5ab4c961c9733dcc9"`);
    await queryRunner.query(`ALTER TABLE "homepage" DROP CONSTRAINT "FK_c458f3d983a18e66ee26588ae87"`);
    await queryRunner.query(`ALTER TABLE "homepage" DROP CONSTRAINT "FK_4b6eaa49f4e036ac1442802df3b"`);
    await queryRunner.query(`ALTER TABLE "zone_services" DROP CONSTRAINT "FK_a4a895fb711550fdb8e8b9cfe00"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
    await queryRunner.query(`ALTER TABLE "units" DROP CONSTRAINT "FK_3061afe5df76df44acb79d8fc2b"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_852f266adc5d67c40405c887b49"`);
    await queryRunner.query(`ALTER TABLE "item_categories" DROP CONSTRAINT "FK_85aa6c4dd057e26e08b1d3919fd"`);
    await queryRunner.query(`ALTER TABLE "connect_bill" DROP CONSTRAINT "FK_bccfffd4fbf86a05b9707ce7998"`);
    await queryRunner.query(`ALTER TABLE "connect_bill" DROP CONSTRAINT "FK_9e698b2ea6200ee8cdb09700910"`);
    await queryRunner.query(`ALTER TABLE "connect_bill" DROP CONSTRAINT "FK_731d5a1a0e05de2ad41518a185b"`);

    // Drop unique constraints
    await queryRunner.query(`ALTER TABLE "trackings" DROP CONSTRAINT "UQ_51ab0edf2f6b4c54e67d2a61972"`);
    await queryRunner.query(`ALTER TABLE "pu_deliveries" DROP CONSTRAINT "UQ_e85b7fa33d2203b4e6ec54f0950"`);
    await queryRunner.query(`ALTER TABLE "finance_cpn" DROP CONSTRAINT "REL_52005126d04209f8b5d8c156cc"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "UQ_baf7e49c4f7b05acfefbf9dbb18"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "UQ_acd5656a9fa7cf04125f0848165"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "REL_11d81cd7be87b6f8865b0cf766"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "UQ_a4866898c9c924ec522162072c1"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "REL_7953eac210a0e34a3e82a3c533"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "checkpoints"`);
    await queryRunner.query(`DROP TABLE "trackings"`);
    await queryRunner.query(`DROP TABLE "pu_deliveries_detail"`);
    await queryRunner.query(`DROP TABLE "pu_deliveries"`);
    await queryRunner.query(`DROP TABLE "other_price"`);
    await queryRunner.query(`DROP TABLE "invoice_detail"`);
    await queryRunner.query(`DROP TABLE "invoice"`);
    await queryRunner.query(`DROP TABLE "finance_cpn"`);
    await queryRunner.query(`DROP TABLE "customer_contract"`);
    await queryRunner.query(`DROP TABLE "contract"`);
    await queryRunner.query(`DROP TABLE "cargo_list_log"`);
    await queryRunner.query(`DROP TABLE "booking_detail"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TABLE "address_books"`);
    await queryRunner.query(`DROP TABLE "receiver_customer"`);
    await queryRunner.query(`DROP TABLE "price_list"`);
    await queryRunner.query(`DROP TABLE "management_staff"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "staffs"`);
    await queryRunner.query(`DROP TABLE "homepage"`);
    await queryRunner.query(`DROP TABLE "zone_services"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "units"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "item_categories"`);
    await queryRunner.query(`DROP TABLE "connect_bill"`);
    await queryRunner.query(`DROP TABLE "typeorm_metadata"`);
    await queryRunner.query(`DROP TABLE "type_of_payment"`);
    await queryRunner.query(`DROP TABLE "translate"`);
    await queryRunner.query(`DROP TABLE "shipping_item"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "postcodes"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "network_customer_types"`);
    await queryRunner.query(`DROP TABLE "ml_exchange_rates"`);
    await queryRunner.query(`DROP TABLE "level_staffs"`);
    await queryRunner.query(`DROP TABLE "japan_address"`);
    await queryRunner.query(`DROP TABLE "history"`);
    await queryRunner.query(`DROP TABLE "department"`);
    await queryRunner.query(`DROP TABLE "delivery_conditions"`);
    await queryRunner.query(`DROP TABLE "customer_type"`);
    await queryRunner.query(`DROP TABLE "currency_unit"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "commodities_type"`);
    await queryRunner.query(`DROP TABLE "categories_post"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "virtual_delivery_address"`);

    // Drop sequences
    await queryRunner.query(`DROP SEQUENCE "virtual_delivery_address_id_seq"`);
    await queryRunner.query(`DROP SEQUENCE "history_code_seq"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "customers_status_enum"`);
  }
}
