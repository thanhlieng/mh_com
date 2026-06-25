import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Mở rộng schema để hỗ trợ 1 account mhcom liên kết đồng thời nhiều hệ A
 * (mhvn + gp), runtime switch không cần re-login.
 *
 * 1) `users.account_type` ENUM 'supplier' | 'customer' (nullable cho data cũ):
 *    cố định loại của account, không thay đổi theo target — account đã là NCC
 *    thì là NCC ở cả mhvn lẫn gp.
 *
 * 2) `user_a_links.a_target` ENUM 'mhvn' | 'gp' NOT NULL DEFAULT 'mhvn':
 *    target hệ A mà link trỏ tới. Default 'mhvn' để backfill row cũ.
 *
 * 3) Đổi unique từ (user_id, link_type, a_entity_id)
 *    thành (user_id, a_target, link_type, a_entity_id) để 1 account có thể
 *    cùng lúc liên kết tới supplier id=12 ở mhvn và supplier id=12 ở gp.
 *
 * 4) Thêm index (user_id, a_target) để ActiveTargetGuard tra cứu nhanh
 *    "account này có entity nào ở target X".
 */
export class AddATargetAndAccountType1772000000000
  implements MigrationInterface
{
  name = 'AddATargetAndAccountType1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) users.account_type
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_account_type_enum') THEN
          CREATE TYPE "users_account_type_enum" AS ENUM ('supplier', 'customer');
        END IF;
      END $$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_type" "users_account_type_enum" NULL`,
    );

    // 2) user_a_links.a_target
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_a_links_a_target_enum') THEN
          CREATE TYPE "user_a_links_a_target_enum" AS ENUM ('mhvn', 'gp');
        END IF;
      END $$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_a_links" ADD COLUMN IF NOT EXISTS "a_target" "user_a_links_a_target_enum" NOT NULL DEFAULT 'mhvn'`,
    );

    // 3) Đổi unique constraint: drop cũ (user_id, link_type, a_entity_id),
    //    add mới (user_id, a_target, link_type, a_entity_id).
    await queryRunner.query(
      `ALTER TABLE "user_a_links" DROP CONSTRAINT IF EXISTS "UQ_user_a_links_user_entity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_a_links" ADD CONSTRAINT "UQ_user_a_links_user_target_entity" UNIQUE ("user_id", "a_target", "link_type", "a_entity_id")`,
    );

    // 4) Index (user_id, a_target) cho ActiveTargetGuard.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_a_links_user_target" ON "user_a_links" ("user_id", "a_target")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert theo thứ tự ngược.
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_a_links_user_target"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_a_links" DROP CONSTRAINT IF EXISTS "UQ_user_a_links_user_target_entity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_a_links" ADD CONSTRAINT "UQ_user_a_links_user_entity" UNIQUE ("user_id", "link_type", "a_entity_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_a_links" DROP COLUMN IF EXISTS "a_target"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "user_a_links_a_target_enum"`);

    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "account_type"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "users_account_type_enum"`);
  }
}
