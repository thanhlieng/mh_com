import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tạo bảng user_a_links: tập liên kết account B ↔ nhiều thực thể A
 * (nhiều supplier HOẶC nhiều customer, mỗi account đúng một loại).
 *
 * Backfill: chuyển giá trị scalar cũ users.a_supplier_id / users.a_customer_id
 * thành bản ghi link tương ứng. Cột scalar được GIỮ LẠI để tương thích ngược;
 * sẽ drop ở migration sau khi toàn bộ code không còn đọc trực tiếp.
 */
export class CreateUserALinks1769300000000 implements MigrationInterface {
  name = 'CreateUserALinks1769300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_a_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "link_type" character varying NOT NULL,
        "a_entity_id" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_a_links" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_a_links_user_entity" UNIQUE ("user_id", "link_type", "a_entity_id"),
        CONSTRAINT "FK_user_a_links_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_user_a_links_user_type" ON "user_a_links" ("user_id", "link_type")`,
    );

    // Backfill supplier links từ cột scalar cũ.
    await queryRunner.query(`
      INSERT INTO "user_a_links" ("user_id", "link_type", "a_entity_id")
      SELECT "id", 'supplier', "a_supplier_id"
      FROM "users"
      WHERE "a_supplier_id" IS NOT NULL AND "a_supplier_id" <> ''
      ON CONFLICT DO NOTHING
    `);

    // Backfill customer links từ cột scalar cũ.
    await queryRunner.query(`
      INSERT INTO "user_a_links" ("user_id", "link_type", "a_entity_id")
      SELECT "id", 'customer', "a_customer_id"
      FROM "users"
      WHERE "a_customer_id" IS NOT NULL AND "a_customer_id" <> ''
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_a_links_user_type"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "user_a_links"`);
  }
}
